-- Relax-Git 快照架构统一迁移
-- 将BaseSnapshot模型扩展以支持统一快照功能
-- 日期：2025-09-26

-- 开始事务
BEGIN;

-- 1. 扩展base_snapshots表，添加统一快照所需字段
ALTER TABLE base_snapshots 
ADD COLUMN owner_id TEXT,
ADD COLUMN title TEXT,
ADD COLUMN description TEXT,
ADD COLUMN expires_at TIMESTAMP,
ADD COLUMN last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN access_count INTEGER DEFAULT 0;

-- 2. 添加索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_base_snapshots_owner_id ON base_snapshots(owner_id);
CREATE INDEX IF NOT EXISTS idx_base_snapshots_expires_at ON base_snapshots(expires_at);
CREATE INDEX IF NOT EXISTS idx_base_snapshots_last_accessed_at ON base_snapshots(last_accessed_at);
CREATE INDEX IF NOT EXISTS idx_base_snapshots_commit_sha ON base_snapshots(commit_sha);

-- 3. 添加外键约束（如果owner_id不为空）
ALTER TABLE base_snapshots 
ADD CONSTRAINT fk_base_snapshots_owner_id 
FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;

-- 4. 更新现有base_snapshots记录的访问时间
UPDATE base_snapshots 
SET last_accessed_at = COALESCE(updated_at, created_at)
WHERE last_accessed_at IS NULL;

-- 5. 创建临时表用于数据迁移验证
CREATE TABLE IF NOT EXISTS migration_log (
    id SERIAL PRIMARY KEY,
    operation TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_count INTEGER,
    status TEXT NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. 记录迁移开始
INSERT INTO migration_log (operation, table_name, record_count, status)
VALUES ('schema_extension', 'base_snapshots', 
        (SELECT COUNT(*) FROM base_snapshots), 'completed');

-- 提交事务
COMMIT;

-- 验证迁移结果
DO $$
DECLARE
    base_snapshot_count INTEGER;
    snapshot_count INTEGER;
    session_snapshot_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO base_snapshot_count FROM base_snapshots;
    SELECT COUNT(*) INTO snapshot_count FROM snapshots;
    SELECT COUNT(*) INTO session_snapshot_count FROM session_snapshots;
    
    RAISE NOTICE 'Migration verification:';
    RAISE NOTICE '- Base snapshots: %', base_snapshot_count;
    RAISE NOTICE '- Traditional snapshots: %', snapshot_count;
    RAISE NOTICE '- Session snapshots: %', session_snapshot_count;
    
    -- 记录验证结果
    INSERT INTO migration_log (operation, table_name, record_count, status)
    VALUES ('verification', 'all_snapshots', 
            base_snapshot_count + snapshot_count + session_snapshot_count, 'completed');
END $$;
