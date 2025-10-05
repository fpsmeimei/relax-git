/**
 * 检查聊天相关表的实际结构
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 检查聊天相关表结构\n');

    // 1. 查询数据库中所有包含chat或message的表
    const tables = await prisma.$queryRaw`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%chat%' OR table_name LIKE '%message%' OR table_name LIKE '%friend%')
      ORDER BY table_name, ordinal_position
    `;

    console.log('数据库中聊天相关的表和字段:');
    let currentTable = '';
    tables.forEach(row => {
      if (row.table_name !== currentTable) {
        currentTable = row.table_name;
        console.log(`\n📋 表: ${row.table_name}`);
      }
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

    // 2. 尝试直接查询ChatMessage表的数据
    console.log('\n=== 尝试查询ChatMessage表 ===');
    try {
      const messageCount = await prisma.chatMessage.count();
      console.log(`ChatMessage表记录数: ${messageCount}`);

      if (messageCount > 0) {
        // 尝试获取一条记录来了解字段结构
        const sampleMessage = await prisma.chatMessage.findFirst();
        console.log('示例消息记录:');
        console.log(JSON.stringify(sampleMessage, null, 2));
      }
    } catch (error) {
      console.log('ChatMessage表查询失败:', error.message);
    }

    // 3. 检查好友相关表
    console.log('\n=== 检查好友表 ===');
    try {
      const friendshipCount = await prisma.friendship.count();
      console.log(`Friendship表记录数: ${friendshipCount}`);

      const friendships = await prisma.friendship.findMany({
        take: 5,
      });

      console.log('好友关系示例:');
      friendships.forEach(f => {
        console.log(
          `  用户 ${f.userId} <-> 好友 ${f.friendId} (状态: ${f.status})`
        );
      });
    } catch (error) {
      console.log('Friendship表查询失败:', error.message);
    }

    // 4. 检查是否有FriendRequest表
    console.log('\n=== 检查好友申请表 ===');
    try {
      const requestCount = await prisma.friendRequest.count();
      console.log(`FriendRequest表记录数: ${requestCount}`);
    } catch (error) {
      console.log('FriendRequest表查询失败:', error.message);
    }
  } catch (error) {
    console.error('检查过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
