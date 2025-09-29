const axios = require('axios');

async function testCommunityAPI() {
  const baseURL = 'http://localhost:3001/api';

  console.log('测试社区 API...');

  try {
    // 测试获取社区 feed
    console.log('\n1. 测试获取社区 feed...');
    const feedResponse = await axios.get(`${baseURL}/community/feed`);
    console.log('✅ Feed API 成功:', feedResponse.data);

    // 测试获取热门标签
    console.log('\n2. 测试获取热门标签...');
    const tagsResponse = await axios.get(`${baseURL}/community/tags/popular`);
    console.log('✅ Tags API 成功:', tagsResponse.data);

    // 测试获取热门语言
    console.log('\n3. 测试获取热门语言...');
    const languagesResponse = await axios.get(
      `${baseURL}/community/languages/popular`
    );
    console.log('✅ Languages API 成功:', languagesResponse.data);
  } catch (error) {
    console.error('❌ API 测试失败:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else {
      console.error('错误信息:', error.message);
    }
  }
}

testCommunityAPI();
