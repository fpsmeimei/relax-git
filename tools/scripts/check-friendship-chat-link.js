const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

const prisma = new PrismaClient();

async function checkFriendshipChatLink() {
  try {
    console.log('=== 检查好友关系与聊天对象关联 ===\n');

    // 检查所有好友关系
    const friendships = await prisma.friendship.findMany({
      include: {
        user: { select: { username: true } },
        friend: { select: { username: true } },
      },
    });

    console.log(`总好友关系数: ${friendships.length}\n`);

    if (friendships.length === 0) {
      console.log('⚠️  没有任何好友关系，请先在聊天室中添加好友');
      return;
    }

    // 检查每个好友关系对应的 Chat 对象
    for (const friendship of friendships) {
      const [x, y] = [friendship.userId, friendship.friendId].sort();
      const directKey = `${x}:${y}`;

      const chat = await prisma.chat.findUnique({
        where: { directKey },
        include: {
          _count: { select: { messages: true } },
        },
      });

      console.log(
        `好友关系: ${friendship.user.username} ↔ ${friendship.friend.username}`
      );
      console.log(`  directKey: ${directKey}`);

      if (chat) {
        console.log(`  ✅ Chat 存在: ${chat.id}`);
        console.log(`  📨 消息数: ${chat._count.messages}`);
      } else {
        console.log(`  ❌ Chat 不存在 - 这是问题的根源！`);
        console.log(`  💡 需要调用 POST /api/chats/direct 创建`);
      }
      console.log('');
    }
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFriendshipChatLink();
