const axios = require('axios');

async function createTestUser() {
  try {
    console.log('=== 创建测试用户 002 ===\n');

    // 可爱的头像 URL（使用 DiceBear API - 机器人风格）
    const avatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=002&backgroundColor=b6e3f4&eyes=bulging,happy&mouth=smile01,smile02&scale=80`;

    // 调用注册 API
    const response = await axios.post('http://localhost:3001/auth/register', {
      username: '002',
      password: '123456',
    });

    console.log('✅ 用户注册成功！');
    console.log('\n用户信息:');
    console.log('  用户名: 002');
    console.log('  密码: 123456');
    console.log('  UID:', response.data.user?.uid);
    console.log('  ID:', response.data.user?.id);

    // 设置头像
    if (response.data.user?.id) {
      console.log('\n正在设置可爱头像...');
      // 注意：需要登录后的 token 才能设置头像
      console.log('头像 URL:', avatar);
      console.log('\n💡 提示：请登录后在个人中心设置头像，或使用以下 URL:');
      console.log('   ', avatar);
    }

    console.log('\n🎉 现在可以使用该账号登录并测试添加好友功能！');
  } catch (error) {
    if (
      error.response?.status === 400 &&
      error.response?.data?.message?.includes('用户名已存在')
    ) {
      console.log('⚠️  用户 002 已存在');
      console.log('✅ 可以直接使用: 用户名 002, 密码 123456');
      console.log('\n💡 可爱头像URL（可在个人中心设置）:');
      console.log(
        '   https://api.dicebear.com/7.x/bottts-neutral/svg?seed=002&backgroundColor=b6e3f4&eyes=bulging,happy&mouth=smile01,smile02&scale=80'
      );
    } else {
      console.error('❌ 创建用户失败:', error.response?.data || error.message);
      throw error;
    }
  }
}

if (require.main === module) {
  createTestUser()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { createTestUser };
