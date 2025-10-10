-- 删除所有基础快照的 SQL 脚本
-- 级联删除会自动处理所有关联数据

-- 查看当前快照数量
SELECT 
  'base_snapshots' as table_name,
  COUNT(*) as count
FROM base_snapshots
UNION ALL
SELECT 
  'session_snapshots' as table_name,
  COUNT(*) as count  
FROM session_snapshots
UNION ALL
SELECT 
  'comments' as table_name,
  COUNT(*) as count
FROM comments;

-- 显示即将删除的快照详情
SELECT 
  bs.id,
  r.name as repo_name,
  rb.name as branch_name,
  bs.status,
  bs.created_at,
  bs.worktree_path
FROM base_snapshots bs
JOIN repositories r ON bs.repo_id = r.id  
JOIN repository_branches rb ON bs.branch_id = rb.id
ORDER BY bs.created_at DESC;

-- 删除所有基础快照（级联删除关联数据）
DELETE FROM base_snapshots;

-- 验证删除结果
SELECT 
  'base_snapshots' as table_name,
  COUNT(*) as remaining_count
FROM base_snapshots
UNION ALL
SELECT 
  'session_snapshots' as table_name,
  COUNT(*) as remaining_count
FROM session_snapshots
UNION ALL  
SELECT 
  'comments' as table_name,
  COUNT(*) as remaining_count
FROM comments;
