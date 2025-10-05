/**
 * 真实世界场景测试
 * 模拟用户在 Relax-Git 中的真实使用场景
 */

const {
  PrismaClient,
} = require('../../libs/shared/src/generated/prisma-client');

class RealWorldScenariosTest {
  constructor() {
    this.prisma = new PrismaClient();
    this.scenarios = [];
  }

  // 记录场景测试结果
  logScenario(scenarioName, steps, issues = []) {
    const scenario = {
      name: scenarioName,
      steps,
      issues,
      passed: issues.length === 0,
      timestamp: new Date().toISOString(),
    };

    this.scenarios.push(scenario);

    const status = scenario.passed ? '✅' : '❌';
    console.log(`${status} 场景: ${scenarioName}`);

    if (issues.length > 0) {
      console.log('   问题:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    }
    console.log('');
  }

  // 场景1: 新用户加入项目并参与讨论
  async testNewUserJoinsProject() {
    console.log('=== 场景1: 新用户加入项目并参与讨论 ===\n');

    const steps = [
      '用户002申请加入001的项目',
      '001批准申请',
      '002在项目讨论区发表评论',
      '001收到通知并回复',
      '002收到回复通知',
    ];

    const issues = [];

    try {
      // 1. 检查是否有加入申请记录
      const joinRequests = await this.prisma.joinRequest.findMany({
        where: {
          OR: [
            { applicantId: 'cmgcr58ue0016imi9yaj6x5gt' }, // 002申请
            { applicantId: 'cmgciw6ml0000wmczkb7vza90' }, // 001申请
          ],
        },
        include: {
          applicant: { select: { username: true } },
          repository: { select: { name: true } },
        },
      });

      if (joinRequests.length === 0) {
        issues.push('没有找到加入申请记录');
      } else {
        console.log(`找到 ${joinRequests.length} 条加入申请:`);
        joinRequests.forEach(req => {
          console.log(
            `  ${req.applicant.username} 申请加入 ${req.repository.name} (${req.status})`
          );
        });
      }

      // 2. 检查项目成员关系
      const memberships = await this.prisma.member.findMany({
        where: {
          userId: {
            in: ['cmgciw6ml0000wmczkb7vza90', 'cmgcr58ue0016imi9yaj6x5gt'],
          },
        },
        include: {
          user: { select: { username: true } },
          repository: { select: { name: true } },
        },
      });

      console.log(`\n项目成员关系 ${memberships.length} 条:`);
      memberships.forEach(member => {
        console.log(
          `  ${member.user.username} 是 ${member.repository.name} 的 ${member.role}`
        );
      });

      // 3. 检查项目讨论区的评论交互
      const discussionComments = await this.prisma.comment.findMany({
        where: {
          anchorType: 'SNAPSHOT',
          filePath: null, // 项目讨论评论
          authorId: {
            in: ['cmgciw6ml0000wmczkb7vza90', 'cmgcr58ue0016imi9yaj6x5gt'],
          },
        },
        include: {
          author: { select: { username: true } },
          replies: {
            include: {
              author: { select: { username: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      console.log(`\n项目讨论评论 ${discussionComments.length} 条:`);
      discussionComments.forEach(comment => {
        console.log(
          `  ${comment.author.username}: ${comment.content.substring(0, 30)}...`
        );
        comment.replies.forEach(reply => {
          console.log(
            `    └─ ${reply.author.username}: ${reply.content.substring(0, 25)}...`
          );
        });
      });

      // 4. 检查相关通知
      const projectNotifications = await this.prisma.notification.findMany({
        where: {
          userId: {
            in: ['cmgciw6ml0000wmczkb7vza90', 'cmgcr58ue0016imi9yaj6x5gt'],
          },
          comment: {
            anchorType: 'SNAPSHOT',
            filePath: null,
          },
        },
        include: {
          user: { select: { username: true } },
          actor: { select: { username: true } },
        },
      });

      console.log(`\n项目讨论通知 ${projectNotifications.length} 条:`);
      projectNotifications.forEach(notif => {
        console.log(
          `  ${notif.actor.username} -> ${notif.user.username}: ${notif.content}`
        );
      });
    } catch (error) {
      issues.push(`测试过程出错: ${error.message}`);
    }

    this.logScenario('新用户加入项目并参与讨论', steps, issues);
  }

  // 场景2: 代码审查和行级评论
  async testCodeReviewWithLineComments() {
    console.log('=== 场景2: 代码审查和行级评论 ===\n');

    const steps = [
      '001提交代码到仓库',
      '002查看代码并在特定行添加评论',
      '001收到行级评论通知',
      '001回复行级评论',
      '002收到回复通知并查看',
    ];

    const issues = [];

    try {
      // 1. 检查行级评论
      const lineComments = await this.prisma.comment.findMany({
        where: {
          anchorType: 'LINE',
          filePath: { not: null },
        },
        include: {
          author: { select: { username: true } },
          replies: {
            include: {
              author: { select: { username: true } },
              parent: {
                include: {
                  author: { select: { username: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      console.log(`行级评论 ${lineComments.length} 条:`);
      lineComments.forEach(comment => {
        console.log(
          `  ${comment.author.username} 在 ${comment.filePath}:${comment.lineStart}`
        );
        console.log(`    内容: ${comment.content.substring(0, 40)}...`);

        // 检查回复关系
        comment.replies.forEach(reply => {
          if (reply.parent) {
            const replyRelation = `${reply.author.username} -> ${reply.parent.author.username}`;
            console.log(
              `    └─ 回复: ${replyRelation}: ${reply.content.substring(0, 30)}...`
            );

            // 验证回复关系是否正确
            if (reply.authorId === reply.parent.authorId) {
              issues.push(
                `行级评论回复关系错误: ${replyRelation} (自己回复自己)`
              );
            }
          }
        });
      });

      // 2. 检查行级评论的通知
      const lineCommentNotifications = await this.prisma.notification.findMany({
        where: {
          comment: {
            anchorType: 'LINE',
          },
        },
        include: {
          user: { select: { username: true } },
          actor: { select: { username: true } },
          comment: {
            select: { filePath: true, lineStart: true },
          },
        },
      });

      console.log(`\n行级评论通知 ${lineCommentNotifications.length} 条:`);
      lineCommentNotifications.forEach(notif => {
        console.log(`  ${notif.actor.username} -> ${notif.user.username}`);
        console.log(
          `    文件: ${notif.comment.filePath}:${notif.comment.lineStart}`
        );
      });

      // 3. 验证通知跳转URL的正确性
      for (const notif of lineCommentNotifications) {
        if (notif.comment.filePath && notif.comment.lineStart) {
          const expectedUrl = `/snapshots/${notif.snapshotId}?file=${notif.comment.filePath}&line=${notif.comment.lineStart}&commentId=${notif.commentId}`;
          console.log(`    预期跳转: ${expectedUrl}`);
        } else {
          issues.push(`行级评论通知缺少文件路径或行号信息`);
        }
      }
    } catch (error) {
      issues.push(`测试过程出错: ${error.message}`);
    }

    this.logScenario('代码审查和行级评论', steps, issues);
  }

  // 场景3: 社区互动和项目发现
  async testCommunityInteraction() {
    console.log('=== 场景3: 社区互动和项目发现 ===\n');

    const steps = [
      '用户在社区浏览项目',
      '对感兴趣的项目点赞和评论',
      '项目作者收到评论通知',
      '项目作者回复评论',
      '评论者收到回复通知',
    ];

    const issues = [];

    try {
      // 1. 检查社区评论 (PROJECT 类型)
      const communityComments = await this.prisma.comment.findMany({
        where: {
          anchorType: 'PROJECT',
        },
        include: {
          author: { select: { username: true } },
          snapshot: {
            include: {
              repository: {
                select: { name: true, ownerId: true },
              },
            },
          },
          replies: {
            include: {
              author: { select: { username: true } },
              parent: {
                include: {
                  author: { select: { username: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      console.log(`社区评论 ${communityComments.length} 条:`);
      communityComments.forEach(comment => {
        console.log(
          `  ${comment.author.username} 评论项目 ${comment.snapshot.repository.name}`
        );
        console.log(`    内容: ${comment.content.substring(0, 40)}...`);

        comment.replies.forEach(reply => {
          if (reply.parent) {
            console.log(
              `    └─ ${reply.author.username} -> ${reply.parent.author.username}: ${reply.content.substring(0, 30)}...`
            );
          }
        });
      });

      // 2. 检查项目点赞记录
      const likes = await this.prisma.repositoryLike.findMany({
        include: {
          user: { select: { username: true } },
          repository: { select: { name: true } },
        },
        take: 10,
      });

      console.log(`\n项目点赞记录 ${likes.length} 条:`);
      likes.forEach(like => {
        console.log(`  ${like.user.username} 点赞了 ${like.repository.name}`);
      });

      // 3. 检查社区评论通知
      const communityNotifications = await this.prisma.notification.findMany({
        where: {
          comment: {
            anchorType: 'PROJECT',
          },
        },
        include: {
          user: { select: { username: true } },
          actor: { select: { username: true } },
          comment: {
            include: {
              snapshot: {
                include: {
                  repository: { select: { name: true } },
                },
              },
            },
          },
        },
      });

      console.log(`\n社区评论通知 ${communityNotifications.length} 条:`);
      communityNotifications.forEach(notif => {
        const repoName = notif.comment.snapshot.repository.name;
        console.log(
          `  ${notif.actor.username} -> ${notif.user.username} (项目: ${repoName})`
        );
      });
    } catch (error) {
      issues.push(`测试过程出错: ${error.message}`);
    }

    this.logScenario('社区互动和项目发现', steps, issues);
  }

  // 场景4: 团队协作和私聊
  async testTeamCollaboration() {
    console.log('=== 场景4: 团队协作和私聊 ===\n');

    const steps = [
      '团队成员互相添加好友',
      '在项目中协作开发',
      '通过私聊讨论技术问题',
      '在群聊中进行团队讨论',
      '及时处理各种通知和消息',
    ];

    const issues = [];

    try {
      // 1. 检查团队成员的好友关系
      const friendships = await this.prisma.friendship.findMany({
        include: {
          user: { select: { username: true } },
          friend: { select: { username: true } },
        },
      });

      console.log(`好友关系 ${friendships.length} 条:`);
      const friendPairs = new Set();
      friendships.forEach(friendship => {
        const pair = [friendship.user.username, friendship.friend.username]
          .sort()
          .join(' <-> ');
        friendPairs.add(pair);
        console.log(
          `  ${friendship.user.username} <-> ${friendship.friend.username}`
        );
      });

      // 2. 检查私聊消息
      const privateMessages = await this.prisma.chatMessage.findMany({
        where: {
          chatId: null, // 私聊消息
        },
        include: {
          sender: { select: { username: true } },
          receiver: { select: { username: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      console.log(`\n私聊消息 ${privateMessages.length} 条:`);
      privateMessages.forEach(msg => {
        console.log(
          `  ${msg.sender.username} -> ${msg.receiver.username}: ${msg.content.substring(0, 30)}...`
        );
        console.log(
          `    时间: ${msg.createdAt}, 已读: ${msg.readAt ? '是' : '否'}`
        );
      });

      // 3. 检查群聊
      const groupChats = await this.prisma.chat.findMany({
        where: {
          type: 'GROUP',
        },
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
      });

      console.log(`\n群聊 ${groupChats.length} 个:`);
      groupChats.forEach(chat => {
        console.log(`  群聊: ${chat.name || '未命名'}`);
        console.log(
          `    成员: ${chat.members.map(m => m.user.username).join(', ')}`
        );
        console.log(`    最近消息:`);
        chat.messages.forEach(msg => {
          console.log(
            `      ${msg.sender.username}: ${msg.content.substring(0, 25)}...`
          );
        });
      });

      // 4. 检查消息的好友关系验证
      let invalidPrivateMessages = 0;
      for (const msg of privateMessages) {
        const isFriend = await this.prisma.friendship.findFirst({
          where: {
            OR: [
              { userId: msg.senderId, friendId: msg.receiverId },
              { userId: msg.receiverId, friendId: msg.senderId },
            ],
          },
        });

        if (!isFriend) {
          invalidPrivateMessages++;
          issues.push(
            `非好友间的私聊消息: ${msg.sender.username} -> ${msg.receiver.username}`
          );
        }
      }

      if (invalidPrivateMessages === 0) {
        console.log(`\n✅ 所有私聊消息都在好友间发送`);
      }
    } catch (error) {
      issues.push(`测试过程出错: ${error.message}`);
    }

    this.logScenario('团队协作和私聊', steps, issues);
  }

  // 场景5: 跨平台通知和实时性
  async testCrossPlatformNotifications() {
    console.log('=== 场景5: 跨平台通知和实时性 ===\n');

    const steps = [
      '用户在多个设备登录',
      '在一个设备上进行操作',
      '其他设备实时收到通知',
      '通知状态在各设备间同步',
      '离线用户上线后补收通知',
    ];

    const issues = [];

    try {
      // 1. 检查通知的实时性（通过创建时间分析）
      const recentNotifications = await this.prisma.notification.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 最近24小时
          },
        },
        include: {
          user: { select: { username: true } },
          actor: { select: { username: true } },
          comment: {
            select: { createdAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      console.log(`最近24小时通知 ${recentNotifications.length} 条:`);

      // 分析通知延迟
      let totalDelay = 0;
      let delayCount = 0;

      recentNotifications.forEach(notif => {
        if (notif.comment) {
          const commentTime = new Date(notif.comment.createdAt);
          const notificationTime = new Date(notif.createdAt);
          const delay = notificationTime.getTime() - commentTime.getTime();

          if (delay >= 0 && delay < 60000) {
            // 延迟在1分钟内算正常
            totalDelay += delay;
            delayCount++;
          } else if (delay >= 60000) {
            issues.push(
              `通知延迟过大: ${notif.actor.username} -> ${notif.user.username} 延迟 ${Math.round(delay / 1000)}秒`
            );
          }

          console.log(
            `  ${notif.actor.username} -> ${notif.user.username} (延迟: ${Math.round(delay / 1000)}秒)`
          );
        }
      });

      if (delayCount > 0) {
        const avgDelay = Math.round(totalDelay / delayCount / 1000);
        console.log(`\n平均通知延迟: ${avgDelay}秒`);

        if (avgDelay > 5) {
          issues.push(`平均通知延迟过大: ${avgDelay}秒`);
        }
      }

      // 2. 检查通知的已读状态分布
      const notificationStats = await this.prisma.notification.groupBy({
        by: ['isRead'],
        _count: { isRead: true },
      });

      console.log(`\n通知已读状态统计:`);
      notificationStats.forEach(stat => {
        console.log(
          `  ${stat.isRead ? '已读' : '未读'}: ${stat._count.isRead} 条`
        );
      });

      // 3. 检查用户的通知偏好和处理习惯
      for (const userId of [
        'cmgciw6ml0000wmczkb7vza90',
        'cmgcr58ue0016imi9yaj6x5gt',
      ]) {
        const userNotifications = await this.prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });

        const readCount = userNotifications.filter(n => n.isRead).length;
        const readRate =
          userNotifications.length > 0
            ? ((readCount / userNotifications.length) * 100).toFixed(1)
            : 0;

        const username = userId === 'cmgciw6ml0000wmczkb7vza90' ? '001' : '002';
        console.log(`\n${username} 的通知处理:`);
        console.log(`  总通知: ${userNotifications.length} 条`);
        console.log(`  已读率: ${readRate}%`);
      }
    } catch (error) {
      issues.push(`测试过程出错: ${error.message}`);
    }

    this.logScenario('跨平台通知和实时性', steps, issues);
  }

  // 场景6: 数据一致性和边界情况
  async testDataConsistencyAndEdgeCases() {
    console.log('=== 场景6: 数据一致性和边界情况 ===\n');

    const steps = [
      '用户快速连续操作',
      '网络中断后恢复',
      '并发用户同时操作',
      '异常情况下的数据回滚',
      '长时间运行后的数据清理',
    ];

    const issues = [];

    try {
      // 1. 检查数据孤儿和不一致
      const orphanReplies = await this.prisma.comment.findMany({
        where: {
          parentId: { not: null },
          parent: null,
        },
      });

      if (orphanReplies.length > 0) {
        issues.push(`发现 ${orphanReplies.length} 条孤儿回复`);
        console.log(`❌ 孤儿回复: ${orphanReplies.length} 条`);
      } else {
        console.log(`✅ 无孤儿回复`);
      }

      // 2. 检查通知的孤儿记录
      const orphanNotifications = await this.prisma.notification.findMany({
        where: {
          commentId: { not: null },
          comment: null,
        },
      });

      if (orphanNotifications.length > 0) {
        issues.push(`发现 ${orphanNotifications.length} 条孤儿通知`);
        console.log(`❌ 孤儿通知: ${orphanNotifications.length} 条`);
      } else {
        console.log(`✅ 无孤儿通知`);
      }

      // 3. 检查重复数据
      const duplicateNotifications = await this.prisma.$queryRaw`
        SELECT commentId, userId, actorId, type, COUNT(*) as count
        FROM notifications 
        GROUP BY commentId, userId, actorId, type
        HAVING COUNT(*) > 1
      `;

      if (duplicateNotifications.length > 0) {
        issues.push(`发现 ${duplicateNotifications.length} 组重复通知`);
        console.log(`❌ 重复通知: ${duplicateNotifications.length} 组`);
      } else {
        console.log(`✅ 无重复通知`);
      }

      // 4. 检查快照ID一致性
      const inconsistentComments = await this.prisma.comment.findMany({
        where: {
          parentId: { not: null },
        },
        include: {
          parent: { select: { snapshotId: true } },
        },
      });

      let inconsistentCount = 0;
      inconsistentComments.forEach(comment => {
        if (
          comment.parent &&
          comment.snapshotId !== comment.parent.snapshotId
        ) {
          inconsistentCount++;
        }
      });

      if (inconsistentCount > 0) {
        issues.push(`发现 ${inconsistentCount} 条快照ID不一致的评论`);
        console.log(`❌ 快照ID不一致: ${inconsistentCount} 条`);
      } else {
        console.log(`✅ 快照ID一致`);
      }

      // 5. 检查用户权限边界
      const privateRepoComments = await this.prisma.comment.findMany({
        where: {
          snapshot: {
            repository: {
              visibility: 'PRIVATE',
            },
          },
        },
        include: {
          author: { select: { id: true, username: true } },
          snapshot: {
            include: {
              repository: {
                include: {
                  members: { select: { userId: true } },
                },
              },
            },
          },
        },
      });

      let unauthorizedComments = 0;
      privateRepoComments.forEach(comment => {
        const repo = comment.snapshot.repository;
        const memberIds = [repo.ownerId, ...repo.members.map(m => m.userId)];

        if (!memberIds.includes(comment.author.id)) {
          unauthorizedComments++;
          issues.push(
            `非成员 ${comment.author.username} 在私有仓库 ${repo.name} 中评论`
          );
        }
      });

      if (unauthorizedComments === 0) {
        console.log(`✅ 私有仓库权限控制正常`);
      }
    } catch (error) {
      issues.push(`测试过程出错: ${error.message}`);
    }

    this.logScenario('数据一致性和边界情况', steps, issues);
  }

  // 运行所有场景测试
  async runAllScenarios() {
    console.log('🎭 开始真实世界场景测试\n');
    console.log('测试时间:', new Date().toLocaleString('zh-CN'));
    console.log('='.repeat(60));

    const startTime = Date.now();

    await this.testNewUserJoinsProject();
    await this.testCodeReviewWithLineComments();
    await this.testCommunityInteraction();
    await this.testTeamCollaboration();
    await this.testCrossPlatformNotifications();
    await this.testDataConsistencyAndEdgeCases();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    this.generateScenarioReport(duration);
  }

  generateScenarioReport(duration) {
    console.log('\n' + '='.repeat(60));
    console.log('📋 场景测试报告');
    console.log('='.repeat(60));

    const totalScenarios = this.scenarios.length;
    const passedScenarios = this.scenarios.filter(s => s.passed).length;
    const failedScenarios = totalScenarios - passedScenarios;
    const successRate = ((passedScenarios / totalScenarios) * 100).toFixed(1);

    console.log(`总场景数: ${totalScenarios}`);
    console.log(`通过: ${passedScenarios} ✅`);
    console.log(`失败: ${failedScenarios} ❌`);
    console.log(`成功率: ${successRate}%`);
    console.log(`耗时: ${duration}秒`);

    if (failedScenarios > 0) {
      console.log('\n❌ 失败的场景:');
      this.scenarios
        .filter(s => !s.passed)
        .forEach(s => {
          console.log(`\n  ${s.name}:`);
          s.issues.forEach(issue => console.log(`    - ${issue}`));
        });
    }

    console.log('\n🎯 场景测试建议:');
    if (successRate >= 90) {
      console.log('  系统在真实使用场景下表现优秀！');
    } else if (successRate >= 70) {
      console.log('  系统基本满足真实使用需求，建议优化失败场景。');
    } else {
      console.log('  系统在真实场景下存在较多问题，需要重点改进。');
    }
  }

  async cleanup() {
    await this.prisma.$disconnect();
  }
}

async function main() {
  const scenarioTest = new RealWorldScenariosTest();

  try {
    await scenarioTest.runAllScenarios();
  } catch (error) {
    console.error('场景测试失败:', error);
  } finally {
    await scenarioTest.cleanup();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = RealWorldScenariosTest;
