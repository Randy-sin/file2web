// 测试 MongoDB 连接
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('正在连接到 MongoDB...');
    console.log('连接字符串:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('成功连接到 MongoDB!');
    
    // 获取所有集合
    const collections = await mongoose.connection.db.collections();
    console.log('数据库中的集合:');
    for (const collection of collections) {
      console.log(`- ${collection.collectionName}`);
    }
    
    console.log('\n连接信息:');
    console.log(`- 数据库名称: ${mongoose.connection.db.databaseName}`);
    console.log(`- 连接状态: ${mongoose.connection.readyState === 1 ? '已连接' : '未连接'}`);
    
    // 关闭连接
    await mongoose.connection.close();
    console.log('\n连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('连接失败:', error);
    process.exit(1);
  }
}

// 执行测试
testConnection(); 