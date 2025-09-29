package health

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/rs/zerolog"

	"github.com/relax-git/worker/worker"
)

// HealthServer 健康检查服务器
type HealthServer struct {
	processor *worker.Processor
	logger    zerolog.Logger
	server    *http.Server
}

// HealthResponse 健康检查响应
type HealthResponse struct {
	Status    string    `json:"status"`
	Timestamp time.Time `json:"timestamp"`
	Version   string    `json:"version"`
	Uptime    string    `json:"uptime"`
	Error     string    `json:"error,omitempty"`
}

// NewHealthServer 创建健康检查服务器
func NewHealthServer(processor *worker.Processor, logger zerolog.Logger, port int, version string) *HealthServer {
	mux := http.NewServeMux()

	server := &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: mux,
	}

	hs := &HealthServer{
		processor: processor,
		logger:    logger.With().Str("component", "health-server").Logger(),
		server:    server,
	}

	// 注册路由
	mux.HandleFunc("/health", hs.healthHandler(version))
	mux.HandleFunc("/ready", hs.readyHandler())
	mux.HandleFunc("/version", hs.versionHandler(version))

	return hs
}

// Start 启动健康检查服务器
func (hs *HealthServer) Start() error {
	hs.logger.Info().
		Str("addr", hs.server.Addr).
		Msg("Starting health check server")

	go func() {
		if err := hs.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			hs.logger.Error().Err(err).Msg("Health server error")
		}
	}()

	return nil
}

// Stop 停止健康检查服务器
func (hs *HealthServer) Stop(ctx context.Context) error {
	hs.logger.Info().Msg("Stopping health check server")
	return hs.server.Shutdown(ctx)
}

// healthHandler 健康检查处理器
func (hs *HealthServer) healthHandler(version string) http.HandlerFunc {
	startTime := time.Now()

	return func(w http.ResponseWriter, r *http.Request) {
		response := HealthResponse{
			Status:    "healthy",
			Timestamp: time.Now(),
			Version:   version,
			Uptime:    time.Since(startTime).String(),
		}

		// 执行健康检查
		if err := hs.processor.HealthCheck(); err != nil {
			response.Status = "unhealthy"
			response.Error = err.Error()
			w.WriteHeader(http.StatusServiceUnavailable)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}

// readyHandler 就绪检查处理器
func (hs *HealthServer) readyHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 简单的就绪检查
		if err := hs.processor.HealthCheck(); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte("Not Ready"))
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Ready"))
	}
}

// versionHandler 版本信息处理器
func (hs *HealthServer) versionHandler(version string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response := map[string]string{
			"version": version,
			"service": "relax-git-worker",
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}
