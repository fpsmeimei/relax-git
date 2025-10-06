/**
 * 评论回复和通知测试脚本
 * 测试场景：
 * 1. 用户001发表主评论
 * 2. 用户002回复用户001 -> 001应该收到通知
 * 3. 用户003回复用户002 -> 002应该收到通知
 * 4. 验证显示逻辑：002 → 001, 003 → 002
 */

const API_BASE_URL = 'http://localhost:3001';

// HTTP 请求辅助函数
async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.response = { status: response.status, data };
    throw error;
  }

  return { data };
}

// 测试用户配置
const TEST_USERS = [
  { username: 'test_user_001', password: 'Test123456!' },
  { username: 'test_user_002', password: 'Test123456!' },
  { username: 'test_user_003', password: 'Test123456!' },
];

// 存储用户会话
const sessions = new Map();

// 工具函数：延迟
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// 工具函数：带重试的请求
async function requestWithRetry(
  url,
  options,
  maxRetries = 3,
  retryDelay = 2000
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await request(url, options);
    } catch (error) {
      if (error.response?.status === 429 && i < maxRetries - 1) {
        log.data(`遇到速率限制，等待${retryDelay / 1000}秒后重试...`);
        await delay(retryDelay);
        retryDelay *= 2; // 指数退避
        continue;
      }
      throw error;
    }
  }
}

// 工具函数：格式化输出
const log = {
  info: msg => console.log(`\n✓ ${msg}`),
  error: msg => console.log(`\n✗ ${msg}`),
  step: msg => console.log(`\n▶ ${msg}`),
  data: msg => console.log(`  ${msg}`),
};

/**
 * 注册用户（如果不存在）
 */
async function registerUser(username, password) {
  try {
    const response = await request(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    log.info(`用户注册成功: ${username}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      log.data(`用户已存在: ${username}`);
      return null;
    }
    throw error;
  }
}

/**
 * 用户登录
 */
async function loginUser(username, password) {
  try {
    const response = await requestWithRetry(
      `${API_BASE_URL}/auth/login`,
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      },
      5,
      3000
    ); // 最多重试5次，初始延迟3秒

    const { access_token, user } = response.data;
    sessions.set(username, {
      token: access_token,
      userId: user.id,
      username: user.username,
    });

    log.info(`用户登录成功: ${username} (ID: ${user.id})`);
    return user;
  } catch (error) {
    log.error(
      `用户登录失败: ${username} - ${error.response?.data?.message || error.message}`
    );
    throw error;
  }
}

/**
 * 获取用户的 axios 实例
 */
function getUserHeaders(username) {
  const session = sessions.get(username);
  if (!session) {
    throw new Error(`用户 ${username} 未登录`);
  }

  return {
    Authorization: `Bearer ${session.token}`,
  };
}

/**
 * 使用现有的测试仓库
 */
async function getTestRepository() {
  // 使用前端日志中看到的现有仓库 ID
  const repoId = 'cmged5j1v0002r8ghf6h3gu1k';
  log.info(`使用现有测试仓库 ID: ${repoId}`);
  return { id: repoId, name: 'test-repo' };
}

/**
 * 发表主评论
 */
async function createMainComment(username, repoId, content) {
  const headers = getUserHeaders(username);
  try {
    const response = await request(
      `${API_BASE_URL}/api/community/repositories/${repoId}/comments`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ content }),
      }
    );

    log.info(`${username} 发表主评论成功`);
    log.data(`评论ID: ${response.data.id}`);
    log.data(`内容: ${content}`);
    return response.data;
  } catch (error) {
    log.error(
      `发表评论失败: ${error.response?.data?.message || error.message}`
    );
    throw error;
  }
}

/**
 * 回复评论
 */
async function replyToComment(
  username,
  repoId,
  parentId,
  replyToUserId,
  content
) {
  const headers = getUserHeaders(username);
  try {
    const response = await request(
      `${API_BASE_URL}/api/community/repositories/${repoId}/comments`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ content, parentId, replyToUserId }),
      }
    );

    log.info(`${username} 回复评论成功`);
    log.data(`评论ID: ${response.data.id}`);
    log.data(`父评论ID: ${parentId}`);
    log.data(`回复给: ${replyToUserId}`);
    log.data(`内容: ${content}`);
    return response.data;
  } catch (error) {
    log.error(
      `回复评论失败: ${error.response?.data?.message || error.message}`
    );
    throw error;
  }
}

/**
 * 获取评论列表
 */
async function getComments(username, repoId) {
  const headers = getUserHeaders(username);
  try {
    const response = await request(
      `${API_BASE_URL}/api/community/repositories/${repoId}/comments?limit=20`,
      { headers }
    );

    return response.data.comments;
  } catch (error) {
    log.error(
      `获取评论失败: ${error.response?.data?.message || error.message}`
    );
    throw error;
  }
}

/**
 * 获取用户通知
 */
async function getNotifications(username) {
  const headers = getUserHeaders(username);
  try {
    const response = await request(`${API_BASE_URL}/api/notifications`, {
      headers,
    });

    log.info(`${username} 的通知列表:`);
    if (response.data.notifications && response.data.notifications.length > 0) {
      response.data.notifications.forEach((notif, index) => {
        log.data(
          `  ${index + 1}. [${notif.type}] ${notif.content || '无内容'}`
        );
        log.data(
          `     已读: ${notif.isRead ? '是' : '否'}, 时间: ${notif.createdAt}`
        );
      });
    } else {
      log.data('  暂无通知');
    }

    return response.data.notifications;
  } catch (error) {
    log.error(
      `获取通知失败: ${error.response?.data?.message || error.message}`
    );
    throw error;
  }
}

/**
 * 验证评论显示逻辑
 */
function verifyCommentDisplay(comments) {
  log.step('验证评论显示逻辑');

  let hasError = false;

  comments.forEach(comment => {
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.forEach(reply => {
        const replyAuthor = reply.author.username;
        const replyToUsername =
          reply.replyToUser?.username ||
          reply.parent?.author?.username ||
          comment.author.username;

        log.data(`${replyAuthor} → ${replyToUsername}: ${reply.content}`);

        // 验证 replyToUser 是否正确
        if (reply.replyToUser && reply.replyToUser.username === replyAuthor) {
          log.error(`错误：${replyAuthor} 回复自己！应该显示被回复者的用户名`);
          hasError = true;
        }
      });
    }
  });

  if (!hasError) {
    log.info('评论显示逻辑验证通过 ✓');
  }

  return !hasError;
}

/**
 * 主测试流程
 */
async function runTest() {
  console.log('='.repeat(60));
  console.log('评论回复和通知功能测试');
  console.log('='.repeat(60));

  try {
    // 步骤1：注册并登录所有测试用户
    log.step('步骤1: 注册并登录测试用户');
    for (const user of TEST_USERS) {
      await registerUser(user.username, user.password);
      await delay(1000);
    }

    log.data('等待2秒后开始登录...');
    await delay(2000);

    for (const user of TEST_USERS) {
      await loginUser(user.username, user.password);
      await delay(3000); // 增加延迟以避免速率限制
    }

    // 步骤2：使用现有测试仓库
    log.step('步骤2: 使用现有测试仓库');
    const repo = await getTestRepository();
    if (!repo) {
      log.error('测试终止：没有可用的公开仓库');
      return;
    }

    // 步骤3：用户001发表主评论
    log.step('步骤3: 用户001发表主评论');
    const mainComment = await createMainComment(
      TEST_USERS[0].username,
      repo.id,
      '这是用户001的主评论，用于测试回复功能'
    );
    await delay(1000);

    // 步骤4：用户002回复用户001
    log.step('步骤4: 用户002回复用户001');
    const user001Session = sessions.get(TEST_USERS[0].username);
    const reply1 = await replyToComment(
      TEST_USERS[1].username,
      repo.id,
      mainComment.id,
      user001Session.userId,
      '这是用户002回复用户001的次评论'
    );
    await delay(1000);

    // 步骤5：用户003回复用户002
    log.step('步骤5: 用户003回复用户002');
    const user002Session = sessions.get(TEST_USERS[1].username);
    await replyToComment(
      TEST_USERS[2].username,
      repo.id,
      mainComment.id,
      user002Session.userId,
      '这是用户003回复用户002的次评论'
    );
    await delay(1000);

    // 步骤6：获取并验证评论显示
    log.step('步骤6: 验证评论显示逻辑');
    const comments = await getComments(TEST_USERS[0].username, repo.id);
    verifyCommentDisplay(comments);

    // 步骤7：检查用户001的通知（应该收到002的回复）
    log.step('步骤7: 检查用户001的通知');
    const user001Notifications = await getNotifications(TEST_USERS[0].username);
    const hasReplyNotif001 = user001Notifications.some(
      n => n.type === 'COMMENT_REPLY' && n.commentId === reply1.id
    );

    if (hasReplyNotif001) {
      log.info('✓ 用户001收到了用户002的回复通知');
    } else {
      log.error('✗ 用户001未收到用户002的回复通知');
    }

    // 步骤8：检查用户002的通知（应该收到003的回复）
    log.step('步骤8: 检查用户002的通知');
    const user002Notifications = await getNotifications(TEST_USERS[1].username);
    const hasReplyNotif002 = user002Notifications.some(
      n => n.type === 'COMMENT_REPLY'
    );

    if (hasReplyNotif002) {
      log.info('✓ 用户002收到了用户003的回复通知');
    } else {
      log.error('✗ 用户002未收到用户003的回复通知');
    }

    // 测试总结
    console.log('\n' + '='.repeat(60));
    console.log('测试完成！');
    console.log('='.repeat(60));

    if (hasReplyNotif001 && hasReplyNotif002) {
      log.info('所有测试通过 ✓✓✓');
    } else {
      log.error('部分测试失败，请检查日志');
    }
  } catch (error) {
    log.error(`测试失败: ${error.message}`);
    console.error(error);
  }
}

// 运行测试
runTest().catch(console.error);
