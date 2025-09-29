import { PrismaClient } from '@relax-git/shared/generated/prisma-client';

const prisma = new PrismaClient();

async function clearAllData() {
  console.log('🗑️ 开始清空所有数据库数据...');

  try {
    // 按照外键依赖顺序删除数据
    console.log('删除时间线事件...');
    await prisma.timelineEvent.deleteMany();

    console.log('删除评论点赞...');
    await prisma.commentLike.deleteMany();

    console.log('删除评论...');
    await prisma.comment.deleteMany();

    console.log('删除通知...');
    await prisma.notification.deleteMany();

    console.log('删除聊天消息...');
    await prisma.message.deleteMany();

    console.log('删除聊天成员...');
    await prisma.chatMember.deleteMany();

    console.log('删除聊天...');
    await prisma.chat.deleteMany();

    console.log('删除搜索历史...');
    await prisma.searchHistory.deleteMany();

    console.log('删除仓库视图统计...');
    await prisma.repositoryViewsAgg.deleteMany();

    console.log('删除仓库视图...');
    await prisma.repositoryView.deleteMany();

    console.log('删除仓库收藏...');
    await prisma.repositoryCollection.deleteMany();

    console.log('删除仓库点赞...');
    await prisma.repositoryLike.deleteMany();

    console.log('删除会话快照...');
    await prisma.sessionSnapshot.deleteMany();

    console.log('删除基础快照...');
    await prisma.baseSnapshot.deleteMany();

    console.log('删除仓库分支...');
    await prisma.repositoryBranch.deleteMany();

    console.log('删除加入申请...');
    await prisma.joinRequest.deleteMany();

    console.log('删除成员...');
    await prisma.member.deleteMany();

    console.log('删除仓库...');
    await prisma.repository.deleteMany();

    console.log('删除用户会话...');
    await prisma.userSession.deleteMany();

    console.log('删除用户...');
    await prisma.user.deleteMany();

    console.log('✅ 所有数据已清空！');
    console.log('📋 数据库现在为空，准备接受真实用户数据');
  } catch (error) {
    console.error('❌ 清空数据失败:', error);
    process.exit(1);
  }
}

clearAllData().finally(async () => {
  await prisma.$disconnect();
});
