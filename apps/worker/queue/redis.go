package queue

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"

	"github.com/relax-git/worker/config"
	"github.com/relax-git/worker/types"
)

// RedisQueue Redis队列客户端
type RedisQueue struct {
	client          *redis.Client
	queueName       string
	searchQueueName string
	logger          zerolog.Logger
}

// NewRedisQueue 创建Redis队列客户端
func NewRedisQueue(cfg *config.Config, logger zerolog.Logger) (*RedisQueue, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.GetRedisAddr(),
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	})

	// 测试连接
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	logger.Info().
		Str("addr", cfg.GetRedisAddr()).
		Int("db", cfg.Redis.DB).
		Msg("Connected to Redis successfully")

	return &RedisQueue{
		client:          rdb,
		queueName:       cfg.Worker.QueueName,
		searchQueueName: "search:queue",
		logger:          logger.With().Str("component", "redis-queue").Logger(),
	}, nil
}

// Consume 消费队列任务
func (q *RedisQueue) Consume(ctx context.Context) (<-chan *types.SnapshotTask, error) {
	taskChan := make(chan *types.SnapshotTask, 10)

	go func() {
		defer close(taskChan)

		for {
			select {
			case <-ctx.Done():
				q.logger.Info().Msg("Queue consumer stopped")
				return
			default:
				// 阻塞式弹出任务，超时时间1秒
				result, err := q.client.BRPop(ctx, 1*time.Second, q.queueName).Result()
				if err != nil {
					if err == redis.Nil {
						// 队列为空，继续等待
						continue
					}
					q.logger.Error().Err(err).Msg("Failed to pop from queue")
					time.Sleep(5 * time.Second) // 错误重试延迟
					continue
				}

				if len(result) < 2 {
					q.logger.Warn().Msg("Invalid queue result format")
					continue
				}

				// 解析任务
				var task types.SnapshotTask
				if err := json.Unmarshal([]byte(result[1]), &task); err != nil {
					q.logger.Error().
						Err(err).
						Str("data", result[1]).
						Msg("Failed to unmarshal task")
					continue
				}

				q.logger.Info().
					Str("task_id", task.ID).
					Str("repo_id", task.RepoID).
					Msg("Received snapshot task")

				select {
				case taskChan <- &task:
				case <-ctx.Done():
					return
				}
			}
		}
	}()

	return taskChan, nil
}

// PublishStatus 发布状态更新
func (q *RedisQueue) PublishStatus(ctx context.Context, result *types.SnapshotResult) error {
	data, err := json.Marshal(result)
	if err != nil {
		return fmt.Errorf("failed to marshal result: %w", err)
	}

	statusChannel := fmt.Sprintf("snapshot:status:%s", result.ID)
	if err := q.client.Publish(ctx, statusChannel, data).Err(); err != nil {
		return fmt.Errorf("failed to publish status: %w", err)
	}

	q.logger.Info().
		Str("task_id", result.ID).
		Str("status", string(result.Status)).
		Msg("Published status update")

	return nil
}

// SetSnapshotStatus 设置快照状态到Redis缓存
func (q *RedisQueue) SetSnapshotStatus(ctx context.Context, snapshotID string, status types.SnapshotStatus) error {
	key := fmt.Sprintf("snapshot:status:%s", snapshotID)
	if err := q.client.Set(ctx, key, string(status), 1*time.Hour).Err(); err != nil {
		return fmt.Errorf("failed to set snapshot status: %w", err)
	}
	return nil
}

// Close 关闭连接
func (q *RedisQueue) Close() error {
	return q.client.Close()
}

// ConsumeSearch 消费搜索队列任务
func (q *RedisQueue) ConsumeSearch(ctx context.Context) (<-chan *types.SearchTask, error) {
	taskChan := make(chan *types.SearchTask, 10)

	go func() {
		defer close(taskChan)

		for {
			select {
			case <-ctx.Done():
				q.logger.Info().Msg("Search queue consumer stopped")
				return
			default:
				// 阻塞式弹出任务，超时时间1秒
				result, err := q.client.BRPop(ctx, 1*time.Second, q.searchQueueName).Result()
				if err != nil {
					if err == redis.Nil {
						// 队列为空，继续等待
						continue
					}
					q.logger.Error().Err(err).Msg("Failed to pop from search queue")
					time.Sleep(5 * time.Second) // 错误重试延迟
					continue
				}

				if len(result) < 2 {
					q.logger.Warn().Msg("Invalid search queue result format")
					continue
				}

				// 解析任务
				var task types.SearchTask
				if err := json.Unmarshal([]byte(result[1]), &task); err != nil {
					q.logger.Error().
						Err(err).
						Str("data", result[1]).
						Msg("Failed to unmarshal search task")
					continue
				}

				q.logger.Info().
					Str("task_id", task.ID).
					Str("query", task.Query).
					Msg("Received search task")

				select {
				case taskChan <- &task:
				case <-ctx.Done():
					return
				}
			}
		}
	}()

	return taskChan, nil
}

// PublishSearchResult 发布搜索结果
func (q *RedisQueue) PublishSearchResult(ctx context.Context, result *types.SearchResult) error {
	data, err := json.Marshal(result)
	if err != nil {
		return fmt.Errorf("failed to marshal search result: %w", err)
	}

	statusChannel := fmt.Sprintf("search:status:%s", result.ID)
	if err := q.client.Publish(ctx, statusChannel, data).Err(); err != nil {
		return fmt.Errorf("failed to publish search result: %w", err)
	}

	q.logger.Info().
		Str("task_id", result.ID).
		Str("status", string(result.Status)).
		Int("matches", len(result.Results)).
		Msg("Published search result")

	return nil
}

// HealthCheck 健康检查
func (q *RedisQueue) HealthCheck(ctx context.Context) error {
	return q.client.Ping(ctx).Err()
}
