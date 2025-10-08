#!/usr/bin/env node

// Railway 健康检查脚本
// 检查 Web 服务是否正常响应

const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  if (res.statusCode >= 200 && res.statusCode < 400) {
    console.log('✅ Health check passed');
    process.exit(0);
  } else {
    console.log(`❌ Health check failed: HTTP ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.log(`❌ Health check failed: ${err.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ Health check failed: Timeout');
  req.destroy();
  process.exit(1);
});

req.end();
