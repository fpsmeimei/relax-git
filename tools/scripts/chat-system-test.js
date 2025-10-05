/**
 * 聊天系统专项测试
 * 测试好友关系、私聊消息、群聊等功能
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

class ChatSystemTest {
  constructor() {
    this.prisma = new PrismaClient();
    this.testUsers = [
      { id: 'cmgciw6ml0000wmczkb7vza90', username: '001' },
      { id: 'cmgcr58ue0016imi9yaj6x5gt', username: '002' },
    ];
  }

  async testFriendSystem() {
    console.log('=== 测试好友系统 ===\n');

    try {
      // 1. 检查好友申请表
      const friendRequests = await this.prisma.friendRequest.findMany({
        include: {
          sender: { select: { username: true } },
          receiver: { select: { username: true } },
        },
      });

      console.log(`好友申请记录: ${friendRequests.length} 条`);
      for (const request of friendRequests.slice(0, 5)) {
        console.log(
          `  ${request.sender.username} -> ${request.receiver.username} (${request.status})`
        );
      }

      // 2. 检查好友关系表
      const friendships = await this.prisma.friendship.findMany({
        include: {
          user: { select: { username: true } },
          friend: { select: { username: true } },
        },
      });

      console.log(`\n好友关系记录: ${friendships.length} 条`);

      // 检查好友关系的对称性
      const friendshipMap = new Map();
      for (const friendship of friendships) {
        const key = `${friendship.userId}-${friendship.friendId}`;
        friendshipMap.set(key, friendship);
      }

      let symmetricCount = 0;
      let asymmetricPairs = [];

      for (const friendship of friendships) {
        const reverseKey = `${friendship.friendId}-${friendship.userId}`;
        if (friendshipMap.has(reverseKey)) {
          symmetricCount++;
        } else {
          asymmetricPairs.push(
            `${friendship.user.username} -> ${friendship.friend.username}`
          );
        }
      }

      console.log(`  对称关系: ${symmetricCount}/${friendships.length}`);
      if (asymmetricPairs.length > 0) {
        console.log(`  ❌ 不对称关系:`);
        asymmetricPairs.forEach(pair => console.log(`    ${pair}`));
      } else {
        console.log(`  ✅ 所有好友关系都是对称的`);
      }
    } catch (error) {
      console.error('好友系统测试失败:', error.message);
    }
  }

  async testChatMessages() {
    console.log('\n=== 测试聊天消息 ===\n');

    try {
      // 1. 检查聊天消息表
      const messages = await this.prisma.chatMessage.findMany({
        include: {
          sender: { select: { username: true } },
          receiver: { select: { username: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      console.log(`聊天消息记录: ${messages.length} 条`);

      for (const message of messages) {
        console.log(
          `  ${message.sender.username} -> ${message.receiver.username}: ${message.content.substring(0, 30)}...`
        );
        console.log(`    时间: ${message.createdAt}`);
      }

      // 2. 检查消息发送者和接收者是否为好友
      let validMessages = 0;
      let invalidMessages = [];

      for (const message of messages) {
        const friendship = await this.prisma.friendship.findFirst({
          where: {
            OR: [
              { userId: message.senderId, friendId: message.receiverId },
              { userId: message.receiverId, friendId: message.senderId },
            ],
          },
        });

        if (friendship) {
          validMessages++;
        } else {
          invalidMessages.push({
            id: message.id,
            sender: message.sender.username,
            receiver: message.receiver.username,
          });
        }
      }

      console.log(`\n消息好友关系验证:`);
      console.log(`  有效消息: ${validMessages}/${messages.length}`);

      if (invalidMessages.length > 0) {
        console.log(`  ❌ 无效消息 (非好友间发送):`);
        invalidMessages.forEach(msg => {
          console.log(
            `    ${msg.sender} -> ${msg.receiver} (消息ID: ${msg.id})`
          );
        });
      } else {
        console.log(`  ✅ 所有消息都在好友间发送`);
      }
    } catch (error) {
      console.error('聊天消息测试失败:', error.message);
    }
  }

  async testMessageReadStatus() {
    console.log('\n=== 测试消息已读状态 ===\n');

    try {
      // 1. 检查消息已读记录
      const readRecords = await this.prisma.chatMessageRead.findMany({
        include: {
          message: {
            include: {
              sender: { select: { username: true } },
              receiver: { select: { username: true } },
            },
          },
          user: { select: { username: true } },
        },
        take: 10,
      });

      console.log(`消息已读记录: ${readRecords.length} 条`);

      for (const record of readRecords) {
        console.log(
          `  ${record.user.username} 已读 ${record.message.sender.username} 的消息`
        );
        console.log(`    已读时间: ${record.readAt}`);
      }

      // 2. 检查已读记录的逻辑正确性
      let validReadRecords = 0;
      let invalidReadRecords = [];

      for (const record of readRecords) {
        // 已读记录的用户应该是消息的接收者
        if (record.userId === record.message.receiverId) {
          validReadRecords++;
        } else {
          invalidReadRecords.push({
            recordId: record.id,
            reader: record.user.username,
            messageReceiver: record.message.receiver.username,
          });
        }
      }

      console.log(`\n已读记录验证:`);
      console.log(`  有效记录: ${validReadRecords}/${readRecords.length}`);

      if (invalidReadRecords.length > 0) {
        console.log(`  ❌ 无效已读记录:`);
        invalidReadRecords.forEach(record => {
          console.log(`    ${record.reader} 标记了不属于自己的消息为已读`);
        });
      } else {
        console.log(`  ✅ 所有已读记录都正确`);
      }
    } catch (error) {
      console.error('消息已读状态测试失败:', error.message);
    }
  }

  async testChatRooms() {
    console.log('\n=== 测试聊天室 ===\n');

    try {
      // 1. 检查聊天室表
      const chats = await this.prisma.chat.findMany({
        include: {
          members: {
            include: {
              user: { select: { username: true } },
            },
          },
          messages: {
            include: {
              sender: { select: { username: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
        },
        take: 5,
      });

      console.log(`聊天室记录: ${chats.length} 个`);

      for (const chat of chats) {
        console.log(`\n聊天室: ${chat.name || '未命名'} (${chat.type})`);
        console.log(
          `  成员 (${chat.members.length}): ${chat.members.map(m => m.user.username).join(', ')}`
        );
        console.log(`  最近消息:`);

        for (const message of chat.messages) {
          console.log(
            `    ${message.sender.username}: ${message.content.substring(0, 30)}...`
          );
        }
      }

      // 2. 检查聊天室成员权限
      for (const chat of chats) {
        const memberIds = new Set(chat.members.map(m => m.userId));

        for (const message of chat.messages) {
          if (!memberIds.has(message.senderId)) {
            console.log(
              `  ❌ 非成员 ${message.sender.username} 在聊天室 ${chat.name} 中发送消息`
            );
          }
        }
      }

      console.log(`\n✅ 聊天室权限检查完成`);
    } catch (error) {
      console.error('聊天室测试失败:', error.message);
    }
  }

  async testUnreadCounts() {
    console.log('\n=== 测试未读消息统计 ===\n');

    try {
      for (const user of this.testUsers) {
        // 计算用户的未读私聊消息数
        const unreadPrivateMessages = await this.prisma.chatMessage.count({
          where: {
            receiverId: user.id,
            readAt: null,
          },
        });

        // 计算用户的未读群聊消息数
        const userChats = await this.prisma.chatMember.findMany({
          where: { userId: user.id },
          select: { chatId: true },
        });

        let unreadGroupMessages = 0;
        for (const chatMember of userChats) {
          const unreadInChat = await this.prisma.chatMessage.count({
            where: {
              chatId: chatMember.chatId,
              senderId: { not: user.id }, // 不包括自己发送的消息
              createdAt: {
                gt: chatMember.lastReadAt || new Date(0), // 大于最后阅读时间
              },
            },
          });
          unreadGroupMessages += unreadInChat;
        }

        console.log(`${user.username} 的未读消息:`);
        console.log(`  私聊: ${unreadPrivateMessages} 条`);
        console.log(`  群聊: ${unreadGroupMessages} 条`);
        console.log(
          `  总计: ${unreadPrivateMessages + unreadGroupMessages} 条`
        );
      }
    } catch (error) {
      console.error('未读消息统计测试失败:', error.message);
    }
  }

  async runAllTests() {
    console.log('🚀 开始聊天系统专项测试\n');
    console.log('测试时间:', new Date().toLocaleString('zh-CN'));
    console.log('='.repeat(50));

    await this.testFriendSystem();
    await this.testChatMessages();
    await this.testMessageReadStatus();
    await this.testChatRooms();
    await this.testUnreadCounts();

    console.log('\n' + '='.repeat(50));
    console.log('✅ 聊天系统测试完成');
  }

  async cleanup() {
    await this.prisma.$disconnect();
  }
}

async function main() {
  const chatTest = new ChatSystemTest();

  try {
    await chatTest.runAllTests();
  } catch (error) {
    console.error('聊天系统测试失败:', error);
  } finally {
    await chatTest.cleanup();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ChatSystemTest;
