package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
	"github.com/rs/zerolog"

	"github.com/relax-git/worker/config"
	"github.com/relax-git/worker/types"
)

// PostgresDB PostgreSQL数据库客户端
type PostgresDB struct {
	db     *sql.DB
	logger zerolog.Logger
}

// NewPostgresDB 创建PostgreSQL数据库客户端
func NewPostgresDB(cfg *config.Config, logger zerolog.Logger) (*PostgresDB, error) {
	db, err := sql.Open("postgres", cfg.GetDatabaseURL())
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// 设置连接池参数
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(time.Hour)

	// 测试连接
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	logger.Info().
		Str("host", cfg.Database.Host).
		Int("port", cfg.Database.Port).
		Str("database", cfg.Database.DBName).
		Msg("Connected to PostgreSQL successfully")

	return &PostgresDB{
		db:     db,
		logger: logger.With().Str("component", "postgres").Logger(),
	}, nil
}

// UpdateSnapshotStatus 更新快照状态（snapshots 表）
func (p *PostgresDB) UpdateSnapshotStatus(ctx context.Context, snapshotID string, status types.SnapshotStatus, errorMessage string) error {
	query := `
		UPDATE snapshots
		SET status = $1, error_message = $2
		WHERE id = $3
	`

	_, err := p.db.ExecContext(ctx, query, string(status), errorMessage, snapshotID)
	if err != nil {
		return fmt.Errorf("failed to update snapshot status: %w", err)
	}

	p.logger.Info().
		Str("snapshot_id", snapshotID).
		Str("status", string(status)).
		Msg("Updated snapshot status")

	return nil
}

// UpdateSnapshotPaths 更新快照路径信息（snapshots 表）
func (p *PostgresDB) UpdateSnapshotPaths(ctx context.Context, snapshotID, worktreePath, bundlePath string) error {
	query := `
		UPDATE snapshots
		SET "worktree_path" = $1, "bundle_path" = $2, status = 'READY', "processedAt" = NOW()
		WHERE id = $3
	`

	_, err := p.db.ExecContext(ctx, query, worktreePath, bundlePath, snapshotID)
	if err != nil {
		return fmt.Errorf("failed to update snapshot paths: %w", err)
	}

	p.logger.Info().
		Str("snapshot_id", snapshotID).
		Str("worktree_path", worktreePath).
		Str("bundle_path", bundlePath).
		Msg("Updated snapshot paths")

	return nil
}

// UpdateBaseSnapshotStatus 更新基础快照状态（base_snapshots 表）
func (p *PostgresDB) UpdateBaseSnapshotStatus(ctx context.Context, snapshotID string, status types.SnapshotStatus, errorMessage string) error {
	query := `
		UPDATE base_snapshots
		SET status = $1, error_message = $2
		WHERE id = $3
	`
	_, err := p.db.ExecContext(ctx, query, string(status), errorMessage, snapshotID)
	if err != nil {
		return fmt.Errorf("failed to update base snapshot status: %w", err)
	}
	p.logger.Info().
		Str("base_snapshot_id", snapshotID).
		Str("status", string(status)).
		Msg("Updated base snapshot status")
	return nil
}

// UpdateBaseSnapshotPaths 更新基础快照路径信息（base_snapshots 表）
func (p *PostgresDB) UpdateBaseSnapshotPaths(ctx context.Context, snapshotID, worktreePath, bundlePath string) error {
	query := `
		UPDATE base_snapshots
		SET "worktree_path" = $1, "bundle_path" = $2, status = $4, "processedAt" = NOW()
		WHERE id = $3
	`
	_, err := p.db.ExecContext(ctx, query, worktreePath, bundlePath, snapshotID, "READY")
	if err != nil {
		p.logger.Error().
			Err(err).
			Str("snapshot_id", snapshotID).
			Str("worktree_path", worktreePath).
			Str("bundle_path", bundlePath).
			Msg("Failed to update base snapshot paths")
		return fmt.Errorf("failed to update base snapshot paths: %w", err)
	}
	p.logger.Info().
		Str("base_snapshot_id", snapshotID).
		Str("worktree_path", worktreePath).
		Str("bundle_path", bundlePath).
		Msg("Updated base snapshot paths")
	return nil
}

// GetRepositoryGitURL 根据仓库ID获取git_url
func (p *PostgresDB) GetRepositoryGitURL(ctx context.Context, repoID string) (string, error) {
	query := `SELECT git_url FROM repositories WHERE id = $1`
	var gitURL string
	err := p.db.QueryRowContext(ctx, query, repoID).Scan(&gitURL)
	if err != nil {
		return "", fmt.Errorf("failed to get repository git_url: %w", err)
	}
	return gitURL, nil
}

// GetSnapshot 获取快照信息
func (p *PostgresDB) GetSnapshot(ctx context.Context, snapshotID string) (*types.SnapshotTask, error) {
	query := `
		SELECT s.id, s.repo_id, s.owner_id, r.git_url, s.commit_sha, s.branch_name,
		       s.title, s.description, s.expires_at, s.created_at
		FROM snapshots s
		JOIN repositories r ON s.repo_id = r.id
		WHERE s.id = $1
	`

	var task types.SnapshotTask
	var title, description sql.NullString

	err := p.db.QueryRowContext(ctx, query, snapshotID).Scan(
		&task.ID,
		&task.RepoID,
		&task.OwnerID,
		&task.GitURL,
		&task.CommitSHA,
		&task.BranchName,
		&title,
		&description,
		&task.ExpiresAt,
		&task.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("snapshot not found: %s", snapshotID)
		}
		return nil, fmt.Errorf("failed to get snapshot: %w", err)
	}

	if title.Valid {
		task.Title = title.String
	}
	if description.Valid {
		task.Description = description.String
	}

	return &task, nil
}

// HealthCheck 健康检查
func (p *PostgresDB) HealthCheck(ctx context.Context) error {
	return p.db.PingContext(ctx)
}

// Close 关闭连接
func (p *PostgresDB) Close() error {
	return p.db.Close()
}
