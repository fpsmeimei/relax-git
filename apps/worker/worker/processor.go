package worker

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/rs/zerolog"

	"github.com/relax-git/worker/config"
	"github.com/relax-git/worker/database"
	"github.com/relax-git/worker/git"
	"github.com/relax-git/worker/queue"
	"github.com/relax-git/worker/search"
	"github.com/relax-git/worker/types"
)

// Processor 快照处理器
type Processor struct {
	config    *config.Config
	logger    zerolog.Logger
	queue     *queue.RedisQueue
	db        *database.PostgresDB
	gitOps    *git.GitOperations
	searchOps *search.SearchOperations

	// 并发控制
	semaphore chan struct{}
	wg        sync.WaitGroup
	ctx       context.Context
	cancel    context.CancelFunc
}

// NewProcessor 创建快照处理器
func NewProcessor(cfg *config.Config, logger zerolog.Logger) (*Processor, error) {
	// 创建Redis队列客户端
	redisQueue, err := queue.NewRedisQueue(cfg, logger)
	if err != nil {
		return nil, fmt.Errorf("failed to create Redis queue: %w", err)
	}

	// 创建数据库客户端
	postgresDB, err := database.NewPostgresDB(cfg, logger)
	if err != nil {
		return nil, fmt.Errorf("failed to create database client: %w", err)
	}

	// 创建Git操作管理器
	gitOperations := git.NewGitOperations(cfg, logger)

	// 创建搜索操作管理器
	searchOperations := search.NewSearchOperations(cfg, logger)

	ctx, cancel := context.WithCancel(context.Background())

	return &Processor{
		config:    cfg,
		logger:    logger.With().Str("component", "processor").Logger(),
		queue:     redisQueue,
		db:        postgresDB,
		gitOps:    gitOperations,
		searchOps: searchOperations,
		semaphore: make(chan struct{}, cfg.Worker.Concurrency),
		ctx:       ctx,
		cancel:    cancel,
	}, nil
}

// Start 启动处理器
func (p *Processor) Start() error {
	p.logger.Info().
		Int("concurrency", p.config.Worker.Concurrency).
		Str("queue_name", p.config.Worker.QueueName).
		Msg("Starting snapshot processor")

	// 消费快照队列任务
	snapshotTaskChan, err := p.queue.Consume(p.ctx)
	if err != nil {
		return fmt.Errorf("failed to start snapshot queue consumer: %w", err)
	}

	// 消费搜索队列任务
	searchTaskChan, err := p.queue.ConsumeSearch(p.ctx)
	if err != nil {
		return fmt.Errorf("failed to start search queue consumer: %w", err)
	}

	// 启动快照任务处理循环
	go p.processLoop(snapshotTaskChan)

	// 启动搜索任务处理循环
	go p.processSearchLoop(searchTaskChan)

	return nil
}

// Stop 停止处理器
func (p *Processor) Stop() {
	p.logger.Info().Msg("Stopping snapshot processor")

	// 取消上下文
	p.cancel()

	// 等待所有任务完成
	p.wg.Wait()

	// 关闭连接
	if err := p.queue.Close(); err != nil {
		p.logger.Error().Err(err).Msg("Failed to close Redis queue")
	}

	if err := p.db.Close(); err != nil {
		p.logger.Error().Err(err).Msg("Failed to close database")
	}

	p.logger.Info().Msg("Snapshot processor stopped")
}

// processLoop 任务处理循环
func (p *Processor) processLoop(taskChan <-chan *types.SnapshotTask) {
	for {
		select {
		case <-p.ctx.Done():
			p.logger.Info().Msg("Process loop stopped")
			return
		case task, ok := <-taskChan:
			if !ok {
				p.logger.Info().Msg("Task channel closed")
				return
			}

			// 并发控制
			p.semaphore <- struct{}{}
			p.wg.Add(1)

			go func(t *types.SnapshotTask) {
				defer func() {
					<-p.semaphore
					p.wg.Done()
				}()

				p.processTask(t)
			}(task)
		}
	}
}

// processTask 处理单个任务
func (p *Processor) processTask(task *types.SnapshotTask) {
	taskLogger := p.logger.With().
		Str("task_id", task.ID).
		Str("repo_id", task.RepoID).
		Str("type", task.Type).
		Logger()

	taskLogger.Info().Msg("Processing snapshot task")

	// 更新状态为处理中
	if err := p.updateStatus(task.ID, types.StatusProcessing, "", task.Type); err != nil {
		taskLogger.Error().Err(err).Msg("Failed to update status to processing")
		return
	}

	// 检查任务是否过期
	if !task.ExpiresAt.IsZero() && time.Now().After(task.ExpiresAt) {
		taskLogger.Warn().Msg("Task expired, skipping")
		_ = p.updateStatus(task.ID, types.StatusExpired, "Task expired", task.Type)
		return
	}

	// 若缺少GitURL，尝试从数据库补全
	if task.GitURL == "" {
		if gitURL, err := p.db.GetRepositoryGitURL(p.ctx, task.RepoID); err == nil {
			task.GitURL = gitURL
		} else {
			taskLogger.Error().Err(err).Msg("Failed to fetch repository git_url")
			_ = p.updateStatus(task.ID, types.StatusFailed, "Missing gitUrl", task.Type)
			return
		}
	}

	// 处理快照
	result, err := p.gitOps.ProcessSnapshot(p.ctx, task)
	if err != nil {
		taskLogger.Error().Err(err).Msg("Failed to process snapshot")
		_ = p.updateStatus(task.ID, types.StatusFailed, err.Error(), task.Type)
		return
	}

	// 更新数据库
	if err := p.updateSnapshotResult(result, task.Type); err != nil {
		taskLogger.Error().Err(err).Msg("Failed to update snapshot result")
		return
	}

	// 发布状态更新
	if err := p.queue.PublishStatus(p.ctx, result); err != nil {
		taskLogger.Error().Err(err).Msg("Failed to publish status update")
	}

	taskLogger.Info().
		Str("status", string(result.Status)).
		Msg("Task processing completed")
}

// updateStatus 更新快照状态
func (p *Processor) updateStatus(snapshotID string, status types.SnapshotStatus, errorMessage string, taskType string) error {
	// 更新数据库（根据任务类型写入 snapshots 或 base_snapshots）
	var err error
	if taskType == "base-snapshot" {
		err = p.db.UpdateBaseSnapshotStatus(p.ctx, snapshotID, status, errorMessage)
	} else {
		err = p.db.UpdateSnapshotStatus(p.ctx, snapshotID, status, errorMessage)
	}
	if err != nil {
		return err
	}

	// 更新Redis缓存
	if err := p.queue.SetSnapshotStatus(p.ctx, snapshotID, status); err != nil {
		p.logger.Warn().Err(err).Msg("Failed to update Redis status cache")
	}

	return nil
}

// updateSnapshotResult 更新快照结果
func (p *Processor) updateSnapshotResult(result *types.SnapshotResult, taskType string) error {
	if result.Status == types.StatusReady {
		// 更新路径信息
		if taskType == "base-snapshot" {
			return p.db.UpdateBaseSnapshotPaths(p.ctx, result.ID, result.WorktreePath, result.BundlePath)
		}
		return p.db.UpdateSnapshotPaths(p.ctx, result.ID, result.WorktreePath, result.BundlePath)
	} else {
		// 更新状态和错误信息
		if taskType == "base-snapshot" {
			return p.db.UpdateBaseSnapshotStatus(p.ctx, result.ID, result.Status, result.ErrorMessage)
		}
		return p.db.UpdateSnapshotStatus(p.ctx, result.ID, result.Status, result.ErrorMessage)
	}
}

// HealthCheck 健康检查
func (p *Processor) HealthCheck() error {
	// 检查Redis连接
	if err := p.queue.HealthCheck(p.ctx); err != nil {
		return fmt.Errorf("Redis health check failed: %w", err)
	}

	// 检查数据库连接
	if err := p.db.HealthCheck(p.ctx); err != nil {
		return fmt.Errorf("Database health check failed: %w", err)
	}

	return nil
}

// processSearchLoop 搜索任务处理循环
func (p *Processor) processSearchLoop(taskChan <-chan *types.SearchTask) {
	for {
		select {
		case <-p.ctx.Done():
			p.logger.Info().Msg("Search process loop stopped")
			return
		case task, ok := <-taskChan:
			if !ok {
				p.logger.Info().Msg("Search task channel closed")
				return
			}

			// 并发控制
			p.semaphore <- struct{}{}
			p.wg.Add(1)

			go func(t *types.SearchTask) {
				defer func() {
					<-p.semaphore
					p.wg.Done()
				}()

				p.processSearchTask(t)
			}(task)
		}
	}
}

// processSearchTask 处理单个搜索任务
func (p *Processor) processSearchTask(task *types.SearchTask) {
	taskLogger := p.logger.With().
		Str("task_id", task.ID).
		Str("query", task.Query).
		Logger()

	taskLogger.Info().Msg("Processing search task")

	// 执行搜索
	result, err := p.searchOps.ExecuteSearch(p.ctx, task)
	if err != nil {
		taskLogger.Error().Err(err).Msg("Failed to execute search")
		return
	}

	// 发布搜索结果
	if err := p.queue.PublishSearchResult(p.ctx, result); err != nil {
		taskLogger.Error().Err(err).Msg("Failed to publish search result")
	}

	taskLogger.Info().
		Str("status", string(result.Status)).
		Int("matches", len(result.Results)).
		Msg("Search task processing completed")
}
