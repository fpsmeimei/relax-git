-- Phase 2.1: 引入 SnapshotArtifact 数据模型
-- 实现 commit 级别的快照复用
-- 日期：2025-09-26

-- 创建 snapshot_artifacts 表
CREATE TABLE IF NOT EXISTS snapshot_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID NOT NULL,
  commit_sha VARCHAR(40) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'QUEUED',
  worktree_path TEXT,
  bundle_path TEXT,
  processed_at TIMESTAMP,
  error_message TEXT,
  metadata JSONB DEFAULT '{}', -- 额外元数据（文件数、大小等）
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- 外键约束
  CONSTRAINT fk_artifact_repo FOREIGN KEY (repo_id) 
    REFERENCES repositories(id) ON DELETE CASCADE,
  
  -- 唯一约束：每个仓库的每个 commit 只有一个 artifact
  CONSTRAINT unique_repo_commit UNIQUE (repo_id, commit_sha)
);

-- 创建索引
CREATE INDEX idx_artifacts_repo_id ON snapshot_artifacts(repo_id);
CREATE INDEX idx_artifacts_commit_sha ON snapshot_artifacts(commit_sha);
CREATE INDEX idx_artifacts_status ON snapshot_artifacts(status);
CREATE INDEX idx_artifacts_created_at ON snapshot_artifacts(created_at);

-- 添加 repository_branches 表的 current_artifact_id 字段
ALTER TABLE repository_branches 
ADD COLUMN IF NOT EXISTS current_artifact_id UUID,
ADD CONSTRAINT fk_branch_artifact 
  FOREIGN KEY (current_artifact_id) 
  REFERENCES snapshot_artifacts(id) ON DELETE SET NULL;

-- 创建索引
CREATE INDEX idx_branches_artifact_id ON repository_branches(current_artifact_id);

-- 创建触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_snapshot_artifacts_updated_at
BEFORE UPDATE ON snapshot_artifacts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 创建视图：方便查询分支的最新 artifact
CREATE OR REPLACE VIEW branch_current_artifacts AS
SELECT 
  b.id as branch_id,
  b.repo_id,
  b.name as branch_name,
  b.commit_sha as branch_commit,
  b.is_default,
  a.id as artifact_id,
  a.commit_sha as artifact_commit,
  a.status,
  a.worktree_path,
  a.bundle_path,
  a.processed_at,
  a.error_message
FROM repository_branches b
LEFT JOIN snapshot_artifacts a ON b.current_artifact_id = a.id;

-- 添加注释
COMMENT ON TABLE snapshot_artifacts IS 'Commit级别的快照工件，支持跨分支复用';
COMMENT ON COLUMN snapshot_artifacts.repo_id IS '所属仓库ID';
COMMENT ON COLUMN snapshot_artifacts.commit_sha IS 'Git提交SHA（40位）';
COMMENT ON COLUMN snapshot_artifacts.status IS '状态：QUEUED/PROCESSING/READY/FAILED';
COMMENT ON COLUMN snapshot_artifacts.worktree_path IS 'Git worktree路径';
COMMENT ON COLUMN snapshot_artifacts.bundle_path IS 'Git bundle存储路径';
COMMENT ON COLUMN snapshot_artifacts.metadata IS 'JSON格式的额外元数据';

-- 数据迁移脚本（从 base_snapshots 迁移现有数据）
-- 注意：这是可选的，仅在需要迁移现有数据时执行
/*
INSERT INTO snapshot_artifacts (
  id,
  repo_id,
  commit_sha,
  status,
  worktree_path,
  bundle_path,
  processed_at,
  error_message,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid() as id,
  bs.repo_id,
  bs.commit_sha,
  bs.status::text,
  bs.worktree_path,
  bs.bundle_path,
  bs.processedAt,
  bs.error_message,
  bs.createdAt,
  bs.updatedAt
FROM base_snapshots bs
WHERE NOT EXISTS (
  SELECT 1 FROM snapshot_artifacts sa 
  WHERE sa.repo_id = bs.repo_id 
  AND sa.commit_sha = bs.commit_sha
)
ON CONFLICT (repo_id, commit_sha) DO NOTHING;

-- 更新分支的 current_artifact_id
UPDATE repository_branches b
SET current_artifact_id = (
  SELECT a.id 
  FROM snapshot_artifacts a 
  WHERE a.repo_id = b.repo_id 
  AND a.commit_sha = b.commit_sha
  LIMIT 1
)
WHERE b.current_artifact_id IS NULL;
*/