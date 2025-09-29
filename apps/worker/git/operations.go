package git

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/rs/zerolog"

	"github.com/relax-git/worker/config"
	"github.com/relax-git/worker/types"
)

// GitOperations Git操作管理器
type GitOperations struct {
	config *config.Config
	logger zerolog.Logger
}

// NewGitOperations 创建Git操作管理器
func NewGitOperations(cfg *config.Config, logger zerolog.Logger) *GitOperations {
	return &GitOperations{
		config: cfg,
		logger: logger.With().Str("component", "git-ops").Logger(),
	}
}

// ProcessSnapshot 处理快照任务
func (g *GitOperations) ProcessSnapshot(ctx context.Context, task *types.SnapshotTask) (*types.SnapshotResult, error) {
	startTime := time.Now()

	g.logger.Info().
		Str("task_id", task.ID).
		Str("git_url", task.GitURL).
		Str("commit_sha", task.CommitSHA).
		Msg("Starting snapshot processing")

	result := &types.SnapshotResult{
		ID:          task.ID,
		Status:      types.StatusProcessing,
		ProcessedAt: time.Now(),
	}

	// 创建临时目录
	tempDir, err := g.createTempDir(task.ID)
	if err != nil {
		return g.failResult(result, types.ErrCodeFileSystem, "Failed to create temp directory", err)
	}
	defer g.cleanup(tempDir)

	// 克隆仓库（传递任务中的代理配置）
	repoPath := filepath.Join(tempDir, "repo")
	if err := g.cloneRepository(ctx, task.GitURL, repoPath, task.ProxyConfig); err != nil {
		return g.failResult(result, types.ErrCodeGitClone, "Failed to clone repository", err)
	}

	// 检查仓库大小
	if err := g.checkRepoSize(repoPath); err != nil {
		return g.failResult(result, types.ErrCodeRepoTooLarge, "Repository too large", err)
	}

	// 创建worktree
	worktreePath, err := g.createWorktree(ctx, repoPath, task.CommitSHA, task.BranchName, task.ID)
	if err != nil {
		return g.failResult(result, types.ErrCodeWorktree, "Failed to create worktree", err)
	}

	// 创建bundle
	bundlePath, err := g.createBundle(ctx, worktreePath, task.ID)
	if err != nil {
		return g.failResult(result, types.ErrCodeBundle, "Failed to create bundle", err)
	}

	// 成功结果
	result.Status = types.StatusReady
	result.WorktreePath = worktreePath
	result.BundlePath = bundlePath
	result.ProcessedAt = time.Now()

	duration := time.Since(startTime)
	g.logger.Info().
		Str("task_id", task.ID).
		Dur("duration", duration).
		Str("worktree_path", worktreePath).
		Str("bundle_path", bundlePath).
		Msg("Snapshot processing completed successfully")

	return result, nil
}

// createTempDir 创建临时目录
func (g *GitOperations) createTempDir(taskID string) (string, error) {
	tempDir := filepath.Join(g.config.Git.TempDir, taskID)
	if err := os.MkdirAll(tempDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create temp directory: %w", err)
	}
	return tempDir, nil
}

// cloneRepository 克隆仓库
func (g *GitOperations) cloneRepository(ctx context.Context, gitURL, repoPath string, taskProxyConfig *types.ProxyConfig) error {
	g.logger.Info().
		Str("git_url", gitURL).
		Str("repo_path", repoPath).
		Msg("Cloning repository")

	// 使用git命令克隆仓库
	cmd := exec.CommandContext(ctx, "git", "clone", gitURL, repoPath)

	// 设置代理环境变量
	env := os.Environ()

	// 优先使用任务中的代理配置
	var httpProxy, httpsProxy string
	if taskProxyConfig != nil {
		httpProxy = taskProxyConfig.HTTPProxy
		httpsProxy = taskProxyConfig.HTTPSProxy
		g.logger.Info().Msg("Using proxy config from task")
	} else {
		// 回退到配置文件中的代理设置
		httpProxy = g.config.Git.HTTPProxy
		httpsProxy = g.config.Git.HTTPSProxy
		g.logger.Info().Msg("Using proxy config from file")
	}

	if httpProxy != "" {
		env = append(env, fmt.Sprintf("HTTP_PROXY=%s", httpProxy))
		env = append(env, fmt.Sprintf("http_proxy=%s", httpProxy))
		g.logger.Info().Str("http_proxy", httpProxy).Msg("Using HTTP proxy")
	}
	if httpsProxy != "" {
		env = append(env, fmt.Sprintf("HTTPS_PROXY=%s", httpsProxy))
		env = append(env, fmt.Sprintf("https_proxy=%s", httpsProxy))
		g.logger.Info().Str("https_proxy", httpsProxy).Msg("Using HTTPS proxy")
	}
	cmd.Env = env

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to clone repository: %w, output: %s", err, string(output))
	}

	return nil
}

// checkRepoSize 检查仓库大小
func (g *GitOperations) checkRepoSize(repoPath string) error {
	var size int64
	err := filepath.Walk(repoPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		size += info.Size()
		return nil
	})

	if err != nil {
		return fmt.Errorf("failed to calculate repo size: %w", err)
	}

	if size > g.config.Git.MaxRepoSize {
		return fmt.Errorf("repository size %d exceeds limit %d", size, g.config.Git.MaxRepoSize)
	}

	g.logger.Info().
		Int64("size_bytes", size).
		Str("size_mb", fmt.Sprintf("%.2f", float64(size)/1024/1024)).
		Msg("Repository size check passed")

	return nil
}

// createWorktree 创建Git worktree
func (g *GitOperations) createWorktree(ctx context.Context, repoPath, commitSHA, branchName, taskID string) (string, error) {
	g.logger.Info().
		Str("commit_sha", commitSHA).
		Str("branch_name", branchName).
		Msg("Creating worktree")

	worktreePath := filepath.Join(g.config.Git.TempDir, fmt.Sprintf("worktree-%s", taskID))

	// 使用git命令创建worktree（go-git的worktree支持有限）
	cmd := exec.CommandContext(ctx, "git", "worktree", "add", worktreePath, commitSHA)
	cmd.Dir = repoPath

	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("failed to create worktree: %w, output: %s", err, string(output))
	}

	g.logger.Info().
		Str("worktree_path", worktreePath).
		Msg("Worktree created successfully")

	return worktreePath, nil
}

// createBundle 创建Git bundle
func (g *GitOperations) createBundle(ctx context.Context, worktreePath, taskID string) (string, error) {
	g.logger.Info().
		Str("worktree_path", worktreePath).
		Msg("Creating bundle")

	// 确保bundle目录存在
	if err := os.MkdirAll(g.config.Git.BundleDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create bundle directory: %w", err)
	}

	bundlePath := filepath.Join(g.config.Git.BundleDir, fmt.Sprintf("%s.bundle", taskID))

	// 使用git命令创建bundle
	cmd := exec.CommandContext(ctx, "git", "bundle", "create", bundlePath, "HEAD")
	cmd.Dir = worktreePath

	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("failed to create bundle: %w, output: %s", err, string(output))
	}

	g.logger.Info().
		Str("bundle_path", bundlePath).
		Msg("Bundle created successfully")

	return bundlePath, nil
}

// cleanup 清理临时文件
func (g *GitOperations) cleanup(tempDir string) {
	if err := os.RemoveAll(tempDir); err != nil {
		g.logger.Warn().
			Err(err).
			Str("temp_dir", tempDir).
			Msg("Failed to cleanup temp directory")
	} else {
		g.logger.Debug().
			Str("temp_dir", tempDir).
			Msg("Cleaned up temp directory")
	}
}

// failResult 创建失败结果
func (g *GitOperations) failResult(result *types.SnapshotResult, code, message string, err error) (*types.SnapshotResult, error) {
	result.Status = types.StatusFailed
	result.ErrorMessage = fmt.Sprintf("%s: %v", message, err)
	result.ProcessedAt = time.Now()

	g.logger.Error().
		Err(err).
		Str("task_id", result.ID).
		Str("error_code", code).
		Str("error_message", result.ErrorMessage).
		Msg("Snapshot processing failed")

	return result, &types.TaskError{
		Code:    code,
		Message: message,
		Details: err.Error(),
	}
}
