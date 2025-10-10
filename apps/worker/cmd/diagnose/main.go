package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

// 诊断 Worker 环境的 Git 操作能力
func main() {
	// 设置日志
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339})
	
	log.Info().Msg("🔍 开始诊断 Worker 环境...")
	
	// 1. 检查基本环境
	checkBasicEnvironment()
	
	// 2. 检查 Git 环境
	checkGitEnvironment()
	
	// 3. 检查文件系统权限
	checkFileSystemPermissions()
	
	// 4. 测试 Git 操作
	testGitOperations()
	
	log.Info().Msg("✅ 诊断完成")
}

func checkBasicEnvironment() {
	log.Info().Msg("📋 检查基本环境...")
	
	// 检查环境变量
	envVars := []string{
		"GIT_TEMP_DIR",
		"GIT_BUNDLE_DIR", 
		"WORKER_WORK_DIR",
		"HOME",
		"USER",
		"PWD",
	}
	
	for _, env := range envVars {
		value := os.Getenv(env)
		if value != "" {
			log.Info().Str("env", env).Str("value", value).Msg("环境变量")
		} else {
			log.Warn().Str("env", env).Msg("环境变量未设置")
		}
	}
	
	// 检查当前用户
	if user := os.Getenv("USER"); user != "" {
		log.Info().Str("user", user).Msg("当前用户")
	}
	
	// 检查工作目录
	if pwd, err := os.Getwd(); err == nil {
		log.Info().Str("pwd", pwd).Msg("当前工作目录")
	}
}

func checkGitEnvironment() {
	log.Info().Msg("🔧 检查 Git 环境...")
	
	// 检查 Git 版本
	if output, err := exec.Command("git", "--version").Output(); err == nil {
		log.Info().Str("version", string(output)).Msg("Git 版本")
	} else {
		log.Error().Err(err).Msg("Git 不可用")
		return
	}
	
	// 检查 Git 配置
	configs := []string{"user.name", "user.email", "core.autocrlf", "core.filemode"}
	for _, config := range configs {
		if output, err := exec.Command("git", "config", "--global", config).Output(); err == nil {
			log.Info().Str("config", config).Str("value", string(output)).Msg("Git 配置")
		} else {
			log.Warn().Str("config", config).Msg("Git 配置未设置")
		}
	}
}

func checkFileSystemPermissions() {
	log.Info().Msg("📁 检查文件系统权限...")
	
	// 测试目录
	testDirs := []string{
		"/tmp",
		"/tmp/relax-git-repos",
		"/tmp/relax-git-bundles",
		"/tmp/relax-git-worker",
	}
	
	for _, dir := range testDirs {
		checkDirectoryPermissions(dir)
	}
}

func checkDirectoryPermissions(dir string) {
	log.Info().Str("dir", dir).Msg("检查目录权限")
	
	// 检查目录是否存在
	if stat, err := os.Stat(dir); err == nil {
		log.Info().
			Str("dir", dir).
			Str("mode", stat.Mode().String()).
			Bool("is_dir", stat.IsDir()).
			Msg("目录存在")
	} else {
		log.Warn().Str("dir", dir).Err(err).Msg("目录不存在，尝试创建")
		
		// 尝试创建目录
		if err := os.MkdirAll(dir, 0755); err != nil {
			log.Error().Str("dir", dir).Err(err).Msg("无法创建目录")
			return
		} else {
			log.Info().Str("dir", dir).Msg("目录创建成功")
		}
	}
	
	// 测试写权限
	testFile := filepath.Join(dir, "test-write.txt")
	if err := os.WriteFile(testFile, []byte("test"), 0644); err != nil {
		log.Error().Str("dir", dir).Err(err).Msg("无写权限")
	} else {
		log.Info().Str("dir", dir).Msg("有写权限")
		os.Remove(testFile) // 清理测试文件
	}
}

func testGitOperations() {
	log.Info().Msg("🧪 测试 Git 操作...")
	
	// 测试仓库 URL
	testRepo := "https://github.com/chalk/chalk.git"
	testCommit := "51557784b829c87ff8d138206598764f2eb957b1"
	
	// 创建测试目录
	testDir := "/tmp/git-test-" + fmt.Sprintf("%d", time.Now().Unix())
	defer os.RemoveAll(testDir)
	
	log.Info().Str("test_dir", testDir).Msg("创建测试目录")
	
	if err := os.MkdirAll(testDir, 0755); err != nil {
		log.Error().Err(err).Msg("无法创建测试目录")
		return
	}
	
	// 1. 测试 git clone
	log.Info().Msg("测试 git clone...")
	repoDir := filepath.Join(testDir, "repo")
	
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	
	cmd := exec.CommandContext(ctx, "git", "clone", testRepo, repoDir)
	cmd.Env = append(os.Environ(),
		"GIT_TERMINAL_PROMPT=0",
		"GIT_ASKPASS=echo",
	)
	
	if output, err := cmd.CombinedOutput(); err != nil {
		log.Error().Err(err).Str("output", string(output)).Msg("git clone 失败")
		return
	} else {
		log.Info().Msg("git clone 成功")
	}
	
	// 2. 测试 git worktree
	log.Info().Msg("测试 git worktree...")
	worktreeDir := filepath.Join(testDir, "worktree-test")
	
	cmd = exec.CommandContext(ctx, "git", "worktree", "add", worktreeDir, testCommit)
	cmd.Dir = repoDir
	
	if output, err := cmd.CombinedOutput(); err != nil {
		log.Error().Err(err).Str("output", string(output)).Msg("git worktree 失败")
		
		// 尝试分析失败原因
		analyzeWorktreeFailure(string(output))
	} else {
		log.Info().Str("worktree_dir", worktreeDir).Msg("git worktree 成功")
		
		// 检查 worktree 内容
		if files, err := os.ReadDir(worktreeDir); err == nil {
			log.Info().Int("file_count", len(files)).Msg("worktree 文件数量")
		}
	}
	
	// 3. 测试 git bundle
	log.Info().Msg("测试 git bundle...")
	bundleFile := filepath.Join(testDir, "test.bundle")
	
	cmd = exec.CommandContext(ctx, "git", "bundle", "create", bundleFile, testCommit)
	cmd.Dir = repoDir
	
	if output, err := cmd.CombinedOutput(); err != nil {
		log.Error().Err(err).Str("output", string(output)).Msg("git bundle 失败")
	} else {
		log.Info().Str("bundle_file", bundleFile).Msg("git bundle 成功")
		
		// 检查 bundle 文件大小
		if stat, err := os.Stat(bundleFile); err == nil {
			log.Info().Int64("size", stat.Size()).Msg("bundle 文件大小")
		}
	}
}

func analyzeWorktreeFailure(output string) {
	log.Info().Msg("🔍 分析 worktree 失败原因...")
	
	// 常见错误模式
	errorPatterns := map[string]string{
		"Permission denied":           "权限不足",
		"No space left on device":    "磁盘空间不足", 
		"Operation not permitted":    "操作不被允许",
		"Read-only file system":      "只读文件系统",
		"Invalid argument":           "参数无效",
		"fatal: not a git repository": "不是 Git 仓库",
	}
	
	for pattern, description := range errorPatterns {
		if contains(output, pattern) {
			log.Error().
				Str("pattern", pattern).
				Str("description", description).
				Msg("检测到错误模式")
		}
	}
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > len(substr) && 
		(s[:len(substr)] == substr || s[len(s)-len(substr):] == substr || 
		 indexOf(s, substr) >= 0))
}

func indexOf(s, substr string) int {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return i
		}
	}
	return -1
}
