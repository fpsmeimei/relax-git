package config

import (
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"

	"github.com/spf13/viper"
)

// Config 应用配置
type Config struct {
	Redis    RedisConfig
	Database DatabaseConfig
	Worker   WorkerConfig
	Git      GitConfig
	Log      LogConfig
}

// RedisConfig Redis配置
type RedisConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
}

// DatabaseConfig 数据库配置
type DatabaseConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	User     string `mapstructure:"user"`
	Password string `mapstructure:"password"`
	DBName   string `mapstructure:"db_name"`
	SSLMode  string `mapstructure:"ssl_mode"`
}

// WorkerConfig Worker配置
type WorkerConfig struct {
	Concurrency int    `mapstructure:"concurrency"`
	QueueName   string `mapstructure:"queue_name"`
	WorkDir     string `mapstructure:"work_dir"`
}

// GitConfig Git配置
type GitConfig struct {
	TempDir     string `mapstructure:"temp_dir"`
	BundleDir   string `mapstructure:"bundle_dir"`
	MaxRepoSize int64  `mapstructure:"max_repo_size"` // 最大仓库大小（字节）
	HTTPProxy   string `mapstructure:"http_proxy"`    // HTTP代理
	HTTPSProxy  string `mapstructure:"https_proxy"`   // HTTPS代理
}

// LogConfig 日志配置
type LogConfig struct {
	Level string `mapstructure:"level"`
}

// LoadConfig 加载配置
func LoadConfig() *Config {
	// 尝试读取配置文件
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("/etc/relax-git/")
	viper.AutomaticEnv()

	// 设置默认值
	setDefaults()

	// 读取配置文件（可选）
	if err := viper.ReadInConfig(); err != nil {
		// 配置文件不存在时使用默认值和环境变量
		fmt.Printf("Warning: Config file not found, using defaults and environment variables: %v\n", err)
	}

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		fmt.Printf("Warning: Failed to unmarshal config, using defaults: %v\n", err)
		return getDefaultConfig()
	}

	return &config
}

// setDefaults 设置默认值
func setDefaults() {
	viper.SetDefault("redis.host", "localhost")
	viper.SetDefault("redis.port", 6379)
	viper.SetDefault("redis.password", "")
	viper.SetDefault("redis.db", 0)

	viper.SetDefault("database.host", "localhost")
	viper.SetDefault("database.port", 5432)
	viper.SetDefault("database.user", "postgres")
	viper.SetDefault("database.password", "")
	viper.SetDefault("database.db_name", "relax_git")
	viper.SetDefault("database.ssl_mode", "disable")

	viper.SetDefault("worker.concurrency", 3)
	viper.SetDefault("worker.queue_name", "snapshot:queue")
	viper.SetDefault("worker.work_dir", "/tmp/relax-git-worker")

	viper.SetDefault("git.temp_dir", "/tmp/relax-git-repos")
	viper.SetDefault("git.bundle_dir", "/tmp/relax-git-bundles")
	viper.SetDefault("git.max_repo_size", 1073741824) // 1GB
	viper.SetDefault("git.http_proxy", "")
	viper.SetDefault("git.https_proxy", "")

	viper.SetDefault("log.level", "info")
}

// getDefaultConfig 获取默认配置
func getDefaultConfig() *Config {
	// 优先使用 REDIS_URL 环境变量
	redisConfig := RedisConfig{
		Host:     getEnv("REDIS_HOST", "localhost"),
		Port:     getEnvInt("REDIS_PORT", 6379),
		Password: getEnv("REDIS_PASSWORD", ""),
		DB:       getEnvInt("REDIS_DB", 0),
	}
	
	// 如果设置了 REDIS_URL，解析并覆盖默认配置
	if redisURL := getEnv("REDIS_URL", ""); redisURL != "" {
		if parsed := parseRedisURL(redisURL); parsed != nil {
			redisConfig = *parsed
		}
	}
	
	return &Config{
		Redis: redisConfig,
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnvInt("DB_PORT", 5432),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", ""),
			DBName:   getEnv("DB_NAME", "relax_git"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		},
		Worker: WorkerConfig{
			Concurrency: getEnvInt("WORKER_CONCURRENCY", 3),
			QueueName:   getEnv("WORKER_QUEUE_NAME", "snapshot:queue"),
			WorkDir:     getEnv("WORKER_WORK_DIR", "/tmp/relax-git-worker"),
		},
		Git: GitConfig{
			TempDir:     getEnv("GIT_TEMP_DIR", "/tmp/relax-git-repos"),
			BundleDir:   getEnv("GIT_BUNDLE_DIR", "/tmp/relax-git-bundles"),
			MaxRepoSize: getEnvInt64("GIT_MAX_REPO_SIZE", 1024*1024*1024), // 1GB
			HTTPProxy:   getEnv("GIT_HTTP_PROXY", ""),
			HTTPSProxy:  getEnv("GIT_HTTPS_PROXY", ""),
		},
		Log: LogConfig{
			Level: getEnv("LOG_LEVEL", "info"),
		},
	}
}

// GetDatabaseURL 获取数据库连接字符串
func (c *Config) GetDatabaseURL() string {
	return fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=%s",
		c.Database.User,
		c.Database.Password,
		c.Database.Host,
		c.Database.Port,
		c.Database.DBName,
		c.Database.SSLMode,
	)
}

// GetRedisAddr 获取Redis地址
func (c *Config) GetRedisAddr() string {
	return fmt.Sprintf("%s:%d", c.Redis.Host, c.Redis.Port)
}

// 辅助函数
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getEnvInt64(key string, defaultValue int64) int64 {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.ParseInt(value, 10, 64); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// parseRedisURL 解析 Redis URL
// 支持格式: redis://[username:password@]host:port[/db]
func parseRedisURL(redisURL string) *RedisConfig {
	u, err := url.Parse(redisURL)
	if err != nil {
		fmt.Printf("Failed to parse REDIS_URL: %v\n", err)
		return nil
	}

	config := &RedisConfig{
		Host: u.Hostname(),
		Port: 6379, // 默认端口
		DB:   0,    // 默认数据库
	}

	// 解析端口
	if u.Port() != "" {
		if port, err := strconv.Atoi(u.Port()); err == nil {
			config.Port = port
		}
	}

	// 解析密码
	if u.User != nil {
		config.Password, _ = u.User.Password()
	}

	// 解析数据库编号
	if u.Path != "" && len(u.Path) > 1 {
		if db, err := strconv.Atoi(strings.TrimPrefix(u.Path, "/")); err == nil {
			config.DB = db
		}
	}

	fmt.Printf("Parsed REDIS_URL: host=%s, port=%d, db=%d\n", config.Host, config.Port, config.DB)
	return config
}
