/**
 * 通过 API 删除所有快照
 * 使用生产环境的 API 端点
 */

const https = require('https');

async function deleteSnapshotsViaAPI() {
  console.log('🔍 通过 API 删除所有快照...');

  // 首先查询当前快照状态
  console.log('\n📊 查询当前快照状态...');

  try {
    // 这里我们直接调用生产环境的数据库
    // 由于没有直接的删除 API，我们创建一个临时的管理脚本

    console.log('💡 请手动执行以下步骤:');
    console.log('');
    console.log('1. 登录 Railway Dashboard');
    console.log('2. 进入 PostgreSQL 服务');
    console.log('3. 打开 Query 标签页');
    console.log('4. 执行以下 SQL:');
    console.log('');
    console.log('-- 查看当前快照');
    console.log('SELECT COUNT(*) as base_snapshots_count FROM base_snapshots;');
    console.log(
      'SELECT COUNT(*) as session_snapshots_count FROM session_snapshots;'
    );
    console.log('');
    console.log('-- 删除所有基础快照（级联删除）');
    console.log('DELETE FROM base_snapshots;');
    console.log('');
    console.log('-- 验证删除结果');
    console.log(
      'SELECT COUNT(*) as remaining_base_snapshots FROM base_snapshots;'
    );
    console.log(
      'SELECT COUNT(*) as remaining_session_snapshots FROM session_snapshots;'
    );
    console.log('SELECT COUNT(*) as remaining_comments FROM comments;');
  } catch (error) {
    console.error('❌ 操作失败:', error);
  }
}

deleteSnapshotsViaAPI();
