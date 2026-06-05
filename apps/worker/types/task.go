package types

import "time"

// ProxyConfig 代理配置
type ProxyConfig struct {
	HTTPProxy  string `json:"httpProxy,omitempty"`
	HTTPSProxy string `json:"httpsProxy,omitempty"`
}

// SnapshotTask 快照任务
type SnapshotTask struct {
	ID          string       `json:"id"`
	Type        string       `json:"type,omitempty"` // e.g. "base-snapshot" for base snapshot tasks
	RepoID      string       `json:"repoId"`
	BranchID    string       `json:"branchId,omitempty"` // only for base snapshot tasks
	OwnerID     string       `json:"ownerId,omitempty"`
	GitURL      string       `json:"gitUrl,omitempty"`
	CommitSHA   string       `json:"commitSha"`
	BranchName  string       `json:"branchName,omitempty"`
	Title       string       `json:"title,omitempty"`
	Description string       `json:"description,omitempty"`
	ExpiresAt   time.Time    `json:"expiresAt"`
	CreatedAt   time.Time    `json:"createdAt"`
	ProxyConfig *ProxyConfig `json:"proxyConfig,omitempty"`
}

// SnapshotStatus 快照状态
type SnapshotStatus string

const (
	StatusQueued     SnapshotStatus = "QUEUED"
	StatusProcessing SnapshotStatus = "PROCESSING"
	StatusReady      SnapshotStatus = "READY"
	StatusExpired    SnapshotStatus = "EXPIRED"
	StatusFailed     SnapshotStatus = "FAILED"
)

// SnapshotResult 快照处理结果
type SnapshotResult struct {
	ID           string         `json:"id"`
	Status       SnapshotStatus `json:"status"`
	WorktreePath string         `json:"worktreePath,omitempty"`
	BundlePath   string         `json:"bundlePath,omitempty"`
	ErrorMessage string         `json:"errorMessage,omitempty"`
	ProcessedAt  time.Time      `json:"processedAt"`
}

// TaskError 任务错误
type TaskError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

func (e *TaskError) Error() string {
	return e.Message
}

// SearchTask 搜索任务
type SearchTask struct {
	ID           string    `json:"id"`
	UserID       string    `json:"userId"`
	RepositoryID string    `json:"repositoryId"`
	SnapshotID   string    `json:"snapshotId,omitempty"`
	WorkDir      string    `json:"workDir,omitempty"`
	Query        string    `json:"query"`
	SearchType   string    `json:"searchType"`
	MaxResults   int       `json:"maxResults"`
	CreatedAt    time.Time `json:"createdAt"`
}

// SearchResult 搜索结果
type SearchResult struct {
	ID           string        `json:"id"`
	Status       SearchStatus  `json:"status"`
	Results      []SearchMatch `json:"results"`
	TotalMatches int           `json:"totalMatches"`
	ProcessedAt  time.Time     `json:"processedAt"`
	ErrorMessage string        `json:"errorMessage,omitempty"`
}

// SearchMatch 搜索匹配项
type SearchMatch struct {
	FilePath    string `json:"filePath"`
	LineNumber  int    `json:"lineNumber"`
	LineContent string `json:"lineContent"`
	MatchStart  int    `json:"matchStart"`
	MatchEnd    int    `json:"matchEnd"`
}

// SearchStatus 搜索状态
type SearchStatus string

const (
	SearchStatusQueued     SearchStatus = "QUEUED"
	SearchStatusProcessing SearchStatus = "PROCESSING"
	SearchStatusCompleted  SearchStatus = "COMPLETED"
	SearchStatusFailed     SearchStatus = "FAILED"
)

// 错误代码常量
const (
	ErrCodeGitClone     = "GIT_CLONE_FAILED"
	ErrCodeWorktree     = "WORKTREE_FAILED"
	ErrCodeBundle       = "BUNDLE_FAILED"
	ErrCodeDatabase     = "DATABASE_FAILED"
	ErrCodeFileSystem   = "FILESYSTEM_FAILED"
	ErrCodeTimeout      = "TIMEOUT"
	ErrCodeInvalidTask  = "INVALID_TASK"
	ErrCodeRepoTooLarge = "REPO_TOO_LARGE"
	ErrCodeSearchFailed = "SEARCH_FAILED"
)
