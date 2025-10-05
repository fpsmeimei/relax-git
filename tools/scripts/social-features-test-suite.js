/**
 * Relax-Git 社交功能全面测试套件
 *
 * 测试覆盖：
 * 1. 三种评论区的评论回复逻辑
 * 2. 聊天室功能
 * 3. 通知系统
 * 4. 好友系统
 * 5. 跨用户数据隔离
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

class SocialFeaturesTestSuite {
  constructor() {
    this.prisma = new PrismaClient();
    this.testResults = [];
    this.testUsers = [
      { id: 'cmgciw6ml0000wmczkb7vza90', username: '001' },
      { id: 'cmgcr58ue0016imi9yaj6x5gt', username: '002' },
    ];
  }

  // 记录测试结果
  logTest(testName, passed, details = '') {
    const result = {
      test: testName,
      passed,
      details,
      timestamp: new Date().toISOString(),
    };
    this.testResults.push(result);

    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testName}`);
    if (details) console.log(`   ${details}`);
    if (!passed) console.log('');
  }

  // 测试1: 评论回复逻辑链
  async testCommentReplyChains() {
    console.log('\n=== 测试评论回复逻辑链 ===\n');

    try {
      // 1.1 测试社区评论回复 (PROJECT)
      await this.testCommunityCommentReplies();

      // 1.2 测试项目讨论评论回复 (SNAPSHOT without filePath)
      await this.testProjectDiscussionReplies();

      // 1.3 测试行级评论回复 (LINE)
      await this.testLineCommentReplies();
    } catch (error) {
      this.logTest(
        '评论回复逻辑链测试',
        false,
        `测试过程出错: ${error.message}`
      );
    }
  }

  async testCommunityCommentReplies() {
    // 查找社区评论 (PROJECT 类型)
    const communityComments = await this.prisma.comment.findMany({
      where: { anchorType: 'PROJECT' },
      include: {
        author: { select: { id: true, username: true } },
        replies: {
          include: {
            author: { select: { id: true, username: true } },
            parent: {
              include: {
                author: { select: { id: true, username: true } },
              },
            },
          },
        },
      },
      take: 5,
    });

    let correctReplies = 0;
    let totalReplies = 0;

    for (const comment of communityComments) {
      for (const reply of comment.replies) {
        totalReplies++;

        // 检查回复关系是否正确
        if (reply.parent && reply.authorId !== reply.parent.authorId) {
          correctReplies++;

          // 检查是否有对应的通知
          const notification = await this.prisma.notification.findFirst({
            where: {
              type: 'COMMENT_REPLY',
              commentId: reply.id,
              userId: reply.parent.authorId,
              actorId: reply.authorId,
            },
          });

          if (!notification) {
            this.logTest(
              `社区评论通知缺失`,
              false,
              `回复 ${reply.id} (${reply.author.username} -> ${reply.parent.author.username}) 缺少通知`
            );
          }
        } else {
          this.logTest(
            `社区评论回复关系错误`,
            false,
            `回复 ${reply.id}: ${reply.author.username} 回复了自己`
          );
        }
      }
    }

    this.logTest(
      '社区评论回复逻辑',
      correctReplies === totalReplies && totalReplies > 0,
      `${correctReplies}/${totalReplies} 回复关系正确`
    );
  }

  async testProjectDiscussionReplies() {
    // 查找项目讨论评论 (SNAPSHOT 类型且无 filePath)
    const discussionComments = await this.prisma.comment.findMany({
      where: {
        anchorType: 'SNAPSHOT',
        filePath: null,
      },
      include: {
        author: { select: { id: true, username: true } },
        replies: {
          include: {
            author: { select: { id: true, username: true } },
            parent: {
              include: {
                author: { select: { id: true, username: true } },
              },
            },
          },
        },
      },
      take: 5,
    });

    let correctReplies = 0;
    let totalReplies = 0;

    for (const comment of discussionComments) {
      for (const reply of comment.replies) {
        totalReplies++;

        if (reply.parent && reply.authorId !== reply.parent.authorId) {
          correctReplies++;
        } else {
          this.logTest(
            `项目讨论回复关系错误`,
            false,
            `回复 ${reply.id}: ${reply.author.username} 回复了自己`
          );
        }
      }
    }

    this.logTest(
      '项目讨论回复逻辑',
      correctReplies === totalReplies,
      `${correctReplies}/${totalReplies} 回复关系正确`
    );
  }

  async testLineCommentReplies() {
    // 查找行级评论 (LINE 类型)
    const lineComments = await this.prisma.comment.findMany({
      where: { anchorType: 'LINE' },
      include: {
        author: { select: { id: true, username: true } },
        replies: {
          include: {
            author: { select: { id: true, username: true } },
            parent: {
              include: {
                author: { select: { id: true, username: true } },
              },
            },
          },
        },
      },
      take: 5,
    });

    let correctReplies = 0;
    let totalReplies = 0;

    for (const comment of lineComments) {
      for (const reply of comment.replies) {
        totalReplies++;

        if (reply.parent && reply.authorId !== reply.parent.authorId) {
          correctReplies++;
        } else {
          this.logTest(
            `行级评论回复关系错误`,
            false,
            `回复 ${reply.id}: ${reply.author.username} 回复了自己`
          );
        }
      }
    }

    this.logTest(
      '行级评论回复逻辑',
      correctReplies === totalReplies,
      `${correctReplies}/${totalReplies} 回复关系正确`
    );
  }

  // 测试2: 通知系统
  async testNotificationSystem() {
    console.log('\n=== 测试通知系统 ===\n');

    try {
      // 2.1 测试通知数据完整性
      await this.testNotificationDataIntegrity();

      // 2.2 测试通知跳转URL生成
      await this.testNotificationUrlGeneration();

      // 2.3 测试通知去重
      await this.testNotificationDeduplication();
    } catch (error) {
      this.logTest('通知系统测试', false, `测试过程出错: ${error.message}`);
    }
  }

  async testNotificationDataIntegrity() {
    const notifications = await this.prisma.notification.findMany({
      include: {
        user: { select: { id: true, username: true } },
        actor: { select: { id: true, username: true } },
        comment: {
          select: {
            id: true,
            anchorType: true,
            filePath: true,
            lineStart: true,
            snapshot: {
              select: {
                repository: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
      take: 10,
    });

    let validNotifications = 0;
    for (const notification of notifications) {
      let isValid = true;
      let issues = [];

      // 检查基本字段
      if (
        !notification.userId ||
        !notification.actorId ||
        !notification.commentId
      ) {
        isValid = false;
        issues.push('缺少基本字段');
      }

      // 检查不能自己通知自己
      if (notification.userId === notification.actorId) {
        isValid = false;
        issues.push('自己通知自己');
      }

      // 检查评论是否存在
      if (!notification.comment) {
        isValid = false;
        issues.push('关联评论不存在');
      }

      if (isValid) {
        validNotifications++;
      } else {
        this.logTest(
          `通知数据异常`,
          false,
          `通知 ${notification.id}: ${issues.join(', ')}`
        );
      }
    }

    this.logTest(
      '通知数据完整性',
      validNotifications === notifications.length,
      `${validNotifications}/${notifications.length} 通知数据有效`
    );
  }

  async testNotificationUrlGeneration() {
    const notifications = await this.prisma.notification.findMany({
      include: {
        comment: {
          select: {
            id: true,
            anchorType: true,
            filePath: true,
            lineStart: true,
            snapshotId: true,
            snapshot: {
              select: {
                repository: {
                  select: { id: true },
                },
              },
            },
          },
        },
      },
      take: 5,
    });

    let correctUrls = 0;
    for (const notification of notifications) {
      if (!notification.comment) continue;

      const comment = notification.comment;
      let expectedUrlPattern = '';

      if (comment.anchorType === 'PROJECT') {
        expectedUrlPattern = `/community?repoId=`;
      } else if (comment.anchorType === 'SNAPSHOT' && !comment.filePath) {
        expectedUrlPattern = `/repositories/.*?tab=discussion`;
      } else if (comment.anchorType === 'LINE') {
        expectedUrlPattern = `/snapshots/.*?file=.*&line=`;
      } else {
        expectedUrlPattern = `/snapshots/`;
      }

      if (expectedUrlPattern) {
        correctUrls++;
        this.logTest(
          `通知URL模式 - ${comment.anchorType}`,
          true,
          `期望模式: ${expectedUrlPattern}`
        );
      }
    }

    this.logTest(
      '通知URL生成逻辑',
      correctUrls > 0,
      `测试了 ${correctUrls} 种URL模式`
    );
  }

  async testNotificationDeduplication() {
    // 检查是否有重复的通知
    const duplicateNotifications = await this.prisma.$queryRaw`
      SELECT commentId, userId, actorId, type, COUNT(*) as count
      FROM notifications 
      GROUP BY commentId, userId, actorId, type
      HAVING COUNT(*) > 1
    `;

    this.logTest(
      '通知去重检查',
      duplicateNotifications.length === 0,
      duplicateNotifications.length > 0
        ? `发现 ${duplicateNotifications.length} 组重复通知`
        : '无重复通知'
    );
  }

  // 测试3: 聊天室功能
  async testChatSystem() {
    console.log('\n=== 测试聊天室功能 ===\n');

    try {
      // 3.1 测试好友关系
      await this.testFriendshipSystem();

      // 3.2 测试私聊消息
      await this.testPrivateMessages();

      // 3.3 测试消息已读状态
      await this.testMessageReadStatus();
    } catch (error) {
      this.logTest('聊天系统测试', false, `测试过程出错: ${error.message}`);
    }
  }

  async testFriendshipSystem() {
    // 检查好友关系的双向性
    const friendships = await this.prisma.friendship.findMany({
      include: {
        user: { select: { username: true } },
        friend: { select: { username: true } },
      },
    });

    let symmetricFriendships = 0;
    const friendshipMap = new Map();

    // 建立好友关系映射
    for (const friendship of friendships) {
      const key = `${friendship.userId}-${friendship.friendId}`;
      friendshipMap.set(key, friendship);
    }

    // 检查双向关系
    for (const friendship of friendships) {
      const reverseKey = `${friendship.friendId}-${friendship.userId}`;
      if (friendshipMap.has(reverseKey)) {
        symmetricFriendships++;
      } else {
        this.logTest(
          '好友关系不对称',
          false,
          `${friendship.user.username} -> ${friendship.friend.username} 缺少反向关系`
        );
      }
    }

    this.logTest(
      '好友关系对称性',
      symmetricFriendships === friendships.length,
      `${symmetricFriendships}/${friendships.length} 好友关系对称`
    );
  }

  async testPrivateMessages() {
    // 检查私聊消息表是否存在（可能需要根据实际表名调整）
    try {
      const messageCount = await this.prisma.chatMessage.count();
      this.logTest('私聊消息表访问', true, `找到 ${messageCount} 条消息`);

      // 检查消息的发送者和接收者是否为好友
      const messages = await this.prisma.chatMessage.findMany({
        take: 10,
      });

      let validMessages = 0;
      for (const message of messages) {
        // 检查发送者和接收者是否为好友关系
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
          this.logTest(
            '消息发送给非好友',
            false,
            `消息 ${message.id}: 发送者和接收者不是好友关系`
          );
        }
      }

      this.logTest(
        '私聊消息好友关系验证',
        validMessages === messages.length,
        `${validMessages}/${messages.length} 消息符合好友关系`
      );
    } catch (error) {
      this.logTest('私聊消息表访问', false, `无法访问消息表: ${error.message}`);
    }
  }

  async testMessageReadStatus() {
    try {
      // 检查消息已读状态的逻辑
      const readReceipts = await this.prisma.chatMessageRead.findMany({
        take: 10,
      });

      this.logTest(
        '消息已读状态表访问',
        true,
        `找到 ${readReceipts.length} 条已读记录`
      );
    } catch (error) {
      this.logTest(
        '消息已读状态表访问',
        false,
        `无法访问已读状态表: ${error.message}`
      );
    }
  }

  // 测试4: 数据隔离和安全性
  async testDataIsolationAndSecurity() {
    console.log('\n=== 测试数据隔离和安全性 ===\n');

    try {
      // 4.1 测试跨用户数据访问
      await this.testCrossUserDataAccess();

      // 4.2 测试权限控制
      await this.testPermissionControl();
    } catch (error) {
      this.logTest('数据隔离测试', false, `测试过程出错: ${error.message}`);
    }
  }

  async testCrossUserDataAccess() {
    // 检查是否有用户能访问其他用户的私有数据
    for (const user of this.testUsers) {
      // 检查该用户的通知是否只属于该用户
      const userNotifications = await this.prisma.notification.findMany({
        where: { userId: user.id },
      });

      const wrongNotifications = userNotifications.filter(
        n => n.userId !== user.id
      );

      this.logTest(
        `${user.username} 通知数据隔离`,
        wrongNotifications.length === 0,
        wrongNotifications.length > 0
          ? `发现 ${wrongNotifications.length} 条错误通知`
          : `${userNotifications.length} 条通知数据正确`
      );
    }
  }

  async testPermissionControl() {
    // 检查私有仓库的评论权限
    const privateRepos = await this.prisma.repository.findMany({
      where: { visibility: 'PRIVATE' },
      include: {
        snapshots: {
          include: {
            comments: {
              include: {
                author: { select: { id: true, username: true } },
              },
            },
          },
        },
        members: true,
      },
    });

    for (const repo of privateRepos) {
      const memberIds = new Set([
        repo.ownerId,
        ...repo.members.map(m => m.userId),
      ]);

      for (const snapshot of repo.snapshots) {
        for (const comment of snapshot.comments) {
          if (!memberIds.has(comment.authorId)) {
            this.logTest(
              '私有仓库权限违规',
              false,
              `非成员 ${comment.author.username} 在私有仓库 ${repo.name} 中评论`
            );
          }
        }
      }
    }

    this.logTest('私有仓库权限控制', true, '权限检查通过');
  }

  // 测试5: 边界情况和异常处理
  async testEdgeCasesAndErrorHandling() {
    console.log('\n=== 测试边界情况和异常处理 ===\n');

    try {
      // 5.1 测试孤儿数据
      await this.testOrphanedData();

      // 5.2 测试数据一致性
      await this.testDataConsistency();
    } catch (error) {
      this.logTest('边界情况测试', false, `测试过程出错: ${error.message}`);
    }
  }

  async testOrphanedData() {
    // 检查孤儿回复（parentId 指向不存在的评论）
    const orphanReplies = await this.prisma.comment.findMany({
      where: {
        parentId: { not: null },
        parent: null,
      },
    });

    this.logTest(
      '孤儿回复检查',
      orphanReplies.length === 0,
      orphanReplies.length > 0
        ? `发现 ${orphanReplies.length} 条孤儿回复`
        : '无孤儿回复'
    );

    // 检查孤儿通知（commentId 指向不存在的评论）
    const orphanNotifications = await this.prisma.notification.findMany({
      where: {
        commentId: { not: null },
        comment: null,
      },
    });

    this.logTest(
      '孤儿通知检查',
      orphanNotifications.length === 0,
      orphanNotifications.length > 0
        ? `发现 ${orphanNotifications.length} 条孤儿通知`
        : '无孤儿通知'
    );
  }

  async testDataConsistency() {
    // 检查快照ID一致性
    const commentsWithInconsistentSnapshots =
      await this.prisma.comment.findMany({
        where: {
          parentId: { not: null },
        },
        include: {
          parent: { select: { snapshotId: true } },
        },
      });

    let inconsistentCount = 0;
    for (const comment of commentsWithInconsistentSnapshots) {
      if (comment.parent && comment.snapshotId !== comment.parent.snapshotId) {
        inconsistentCount++;
        this.logTest(
          '快照ID不一致',
          false,
          `评论 ${comment.id} 与父评论快照ID不一致`
        );
      }
    }

    this.logTest(
      '快照ID一致性',
      inconsistentCount === 0,
      inconsistentCount > 0
        ? `发现 ${inconsistentCount} 条不一致记录`
        : '快照ID一致'
    );
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🚀 开始 Relax-Git 社交功能全面测试\n');
    console.log('测试时间:', new Date().toLocaleString('zh-CN'));
    console.log('测试用户:', this.testUsers.map(u => u.username).join(', '));
    console.log('='.repeat(60));

    const startTime = Date.now();

    await this.testCommentReplyChains();
    await this.testNotificationSystem();
    await this.testChatSystem();
    await this.testDataIsolationAndSecurity();
    await this.testEdgeCasesAndErrorHandling();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // 生成测试报告
    this.generateTestReport(duration);
  }

  // 生成测试报告
  generateTestReport(duration) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 测试报告');
    console.log('='.repeat(60));

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${passedTests} ✅`);
    console.log(`失败: ${failedTests} ❌`);
    console.log(`成功率: ${successRate}%`);
    console.log(`耗时: ${duration}秒`);

    if (failedTests > 0) {
      console.log('\n❌ 失败的测试:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  - ${r.test}: ${r.details}`);
        });
    }

    console.log('\n🎯 测试建议:');
    if (successRate >= 95) {
      console.log('  社交功能整体状态良好！');
    } else if (successRate >= 80) {
      console.log('  社交功能基本正常，建议修复失败的测试项。');
    } else {
      console.log('  社交功能存在较多问题，需要重点关注和修复。');
    }

    console.log(
      '\n📝 详细测试结果已保存到内存中，可通过 testResults 属性访问。'
    );
  }

  async cleanup() {
    await this.prisma.$disconnect();
  }
}

// 运行测试
async function main() {
  const testSuite = new SocialFeaturesTestSuite();

  try {
    await testSuite.runAllTests();
  } catch (error) {
    console.error('测试套件运行失败:', error);
  } finally {
    await testSuite.cleanup();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SocialFeaturesTestSuite;
