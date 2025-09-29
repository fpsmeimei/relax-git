package search

import (
	"bufio"
	"context"
	"fmt"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/rs/zerolog"

	"github.com/relax-git/worker/config"
	"github.com/relax-git/worker/types"
)

// SearchOperations 搜索操作
type SearchOperations struct {
	logger zerolog.Logger
	config *config.Config
}

// NewSearchOperations 创建搜索操作实例
func NewSearchOperations(cfg *config.Config, logger zerolog.Logger) *SearchOperations {
	return &SearchOperations{
		logger: logger.With().Str("component", "search-operations").Logger(),
		config: cfg,
	}
}

// ExecuteSearch 执行搜索任务
func (s *SearchOperations) ExecuteSearch(ctx context.Context, task *types.SearchTask) (*types.SearchResult, error) {
	startTime := time.Now()

	s.logger.Info().
		Str("task_id", task.ID).
		Str("query", task.Query).
		Str("search_type", task.SearchType).
		Msg("Starting search execution")

	result := &types.SearchResult{
		ID:          task.ID,
		Status:      types.SearchStatusProcessing,
		ProcessedAt: time.Now(),
	}

	// 获取快照的worktree路径
	workDir, err := s.getSnapshotWorkDir(task.SnapshotID)
	if err != nil {
		return s.failResult(result, types.ErrCodeFileSystem, "Failed to get snapshot work directory", err)
	}

	// 执行搜索
	matches, err := s.executeRipgrep(ctx, task.Query, workDir, task.SearchType, task.MaxResults)
	if err != nil {
		return s.failResult(result, types.ErrCodeSearchFailed, "Search execution failed", err)
	}

	// 限制结果数量
	if len(matches) > task.MaxResults {
		matches = matches[:task.MaxResults]
	}

	result.Status = types.SearchStatusCompleted
	result.Results = matches
	result.TotalMatches = len(matches)
	result.ProcessedAt = time.Now()

	s.logger.Info().
		Str("task_id", task.ID).
		Int("matches", len(matches)).
		Dur("duration", time.Since(startTime)).
		Msg("Search execution completed")

	return result, nil
}

// executeRipgrep 执行ripgrep命令
func (s *SearchOperations) executeRipgrep(ctx context.Context, query, workDir, searchType string, maxResults int) ([]types.SearchMatch, error) {
	var args []string

	// 基础参数
	args = append(args, "--line-number", "--no-heading", "--color=never")

	// 根据搜索类型设置参数
	switch searchType {
	case "CONTENT":
		// 默认内容搜索
		args = append(args, query)
	case "FILENAME":
		// 文件名搜索
		args = append(args, "--files-with-matches", query)
	case "REGEX":
		// 正则表达式搜索
		args = append(args, "--regexp", query)
	default:
		// 默认为内容搜索
		args = append(args, query)
	}

	// 限制结果数量
	args = append(args, "--max-count", strconv.Itoa(maxResults))

	// 设置工作目录
	args = append(args, workDir)

	s.logger.Debug().
		Strs("args", args).
		Str("work_dir", workDir).
		Msg("Executing ripgrep command")

	// 创建命令
	cmd := exec.CommandContext(ctx, "rg", args...)
	cmd.Dir = workDir

	// 执行命令
	output, err := cmd.Output()
	if err != nil {
		// ripgrep返回非零退出码时，可能是没有找到匹配项
		if exitError, ok := err.(*exec.ExitError); ok {
			if exitError.ExitCode() == 1 {
				// 没有找到匹配项，返回空结果
				return []types.SearchMatch{}, nil
			}
		}
		return nil, fmt.Errorf("ripgrep execution failed: %w", err)
	}

	// 解析输出
	matches, err := s.parseRipgrepOutput(output, searchType)
	if err != nil {
		return nil, fmt.Errorf("failed to parse ripgrep output: %w", err)
	}

	return matches, nil
}

// parseRipgrepOutput 解析ripgrep输出
func (s *SearchOperations) parseRipgrepOutput(output []byte, searchType string) ([]types.SearchMatch, error) {
	var matches []types.SearchMatch
	scanner := bufio.NewScanner(strings.NewReader(string(output)))

	// 用于解析行号和内容的正则表达式
	lineRegex := regexp.MustCompile(`^([^:]+):(\d+):(.*)$`)

	for scanner.Scan() {
		line := scanner.Text()
		
		if searchType == "FILENAME" {
			// 文件名搜索只返回文件路径
			matches = append(matches, types.SearchMatch{
				FilePath:    line,
				LineNumber:  0,
				LineContent: "",
				MatchStart:  0,
				MatchEnd:    0,
			})
			continue
		}

		// 解析内容搜索结果
		match := lineRegex.FindStringSubmatch(line)
		if len(match) != 4 {
			s.logger.Warn().
				Str("line", line).
				Msg("Failed to parse ripgrep output line")
			continue
		}

		filePath := match[1]
		lineNumber, err := strconv.Atoi(match[2])
		if err != nil {
			s.logger.Warn().
				Str("line_number", match[2]).
				Msg("Failed to parse line number")
			continue
		}
		lineContent := match[3]

		// 简单的匹配位置计算（可以后续优化）
		matchStart := 0
		matchEnd := len(lineContent)

		matches = append(matches, types.SearchMatch{
			FilePath:    filePath,
			LineNumber:  lineNumber,
			LineContent: lineContent,
			MatchStart:  matchStart,
			MatchEnd:    matchEnd,
		})
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("error reading ripgrep output: %w", err)
	}

	return matches, nil
}

// getSnapshotWorkDir 获取快照的工作目录
func (s *SearchOperations) getSnapshotWorkDir(snapshotID string) (string, error) {
	// 这里应该从数据库查询快照的worktreePath
	// 为了简化，暂时使用固定路径格式
	// TODO: 集成数据库查询
	workDir := filepath.Join(s.config.Git.TempDir, "snapshots", snapshotID)
	return workDir, nil
}

// failResult 创建失败结果
func (s *SearchOperations) failResult(result *types.SearchResult, code, message string, err error) (*types.SearchResult, error) {
	result.Status = types.SearchStatusFailed
	result.ErrorMessage = fmt.Sprintf("%s: %v", message, err)
	result.ProcessedAt = time.Now()

	s.logger.Error().
		Str("task_id", result.ID).
		Str("error_code", code).
		Err(err).
		Msg(message)

	return result, fmt.Errorf("%s: %w", message, err)
}
