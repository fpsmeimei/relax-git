package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"github.com/relax-git/worker/config"
	"github.com/relax-git/worker/health"
	"github.com/relax-git/worker/worker"
)

var (
	version = "0.1.0"
	commit  = "dev"
	date    = "unknown"
)

func main() {
	// 设置日志
	zerolog.TimeFieldFormat = time.RFC3339
	log := zerolog.New(os.Stdout).With().Timestamp().Logger()

	// 创建根命令
	rootCmd := &cobra.Command{
		Use:   "relax-git-worker",
		Short: "Relax-Git Worker Service",
		Long:  "高性能 Git worktree 操作服务",
		Run: func(cmd *cobra.Command, args []string) {
			runWorker(log)
		},
	}

	// 添加版本命令
	versionCmd := &cobra.Command{
		Use:   "version",
		Short: "显示版本信息",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Printf("Relax-Git Worker %s\n", version)
			fmt.Printf("Commit: %s\n", commit)
			fmt.Printf("Built: %s\n", date)
		},
	}

	rootCmd.AddCommand(versionCmd)

	// 配置文件和环境变量
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("/etc/relax-git/")
	viper.AutomaticEnv()

	// 设置默认值
	viper.SetDefault("redis.host", "localhost")
	viper.SetDefault("redis.port", 6379)
	viper.SetDefault("worker.concurrency", 3)
	viper.SetDefault("log.level", "info")

	// 执行命令
	if err := rootCmd.Execute(); err != nil {
		log.Fatal().Err(err).Msg("Failed to execute command")
	}
}

func runWorker(log zerolog.Logger) {
	log.Info().Msg("Starting Relax-Git Worker...")

	// 加载配置
	cfg := config.LoadConfig()

	// 设置日志级别
	level, err := zerolog.ParseLevel(cfg.Log.Level)
	if err != nil {
		log.Warn().Str("level", cfg.Log.Level).Msg("Invalid log level, using info")
		level = zerolog.InfoLevel
	}
	zerolog.SetGlobalLevel(level)

	// 创建处理器
	processor, err := worker.NewProcessor(cfg, log)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to create processor")
	}

	// 健康检查
	if err := processor.HealthCheck(); err != nil {
		log.Fatal().Err(err).Msg("Health check failed")
	}

	// 启动处理器
	if err := processor.Start(); err != nil {
		log.Fatal().Err(err).Msg("Failed to start processor")
	}

	// 启动健康检查服务器
	healthServer := health.NewHealthServer(processor, log, 3002, version)
	if err := healthServer.Start(); err != nil {
		log.Fatal().Err(err).Msg("Failed to start health server")
	}

	log.Info().
		Int("concurrency", cfg.Worker.Concurrency).
		Str("queue_name", cfg.Worker.QueueName).
		Int("health_port", 3002).
		Msg("Worker started successfully")
	
	// 启动时运行环境诊断
	go runStartupDiagnosis()

	// 监听系统信号
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	<-sigChan
	log.Info().Msg("Shutting down worker...")

	// 优雅关闭
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()

	// 停止健康检查服务器
	if err := healthServer.Stop(shutdownCtx); err != nil {
		log.Error().Err(err).Msg("Failed to stop health server")
	}

	// 停止处理器
	processor.Stop()
	log.Info().Msg("Worker stopped")
}

// runStartupDiagnosis 启动时运行环境诊断
func runStartupDiagnosis() {
	// 等待一秒让 Worker 完全启动
	time.Sleep(1 * time.Second)
	
	log.Info().Msg("🔍 Running startup environment diagnosis...")
	
	// 执行诊断命令
	cmd := exec.Command("/app/diagnose")
	output, err := cmd.CombinedOutput()
	
	if err != nil {
		log.Error().
			Err(err).
			Str("output", string(output)).
			Msg("❌ Failed to run diagnosis")
		return
	}
	
	// 分行输出诊断结果，避免日志截断
	lines := strings.Split(string(output), "\n")
	log.Info().Msg("📋 === DIAGNOSIS RESULTS START ===")
	for i, line := range lines {
		if strings.TrimSpace(line) != "" {
			log.Info().
				Int("line", i+1).
				Str("content", line).
				Msg("📄 Diagnosis output")
		}
	}
	log.Info().Msg("📋 === DIAGNOSIS RESULTS END ===")
}
