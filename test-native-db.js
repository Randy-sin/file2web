// 测试 MongoDB 原生驱动程序连接
require('dotenv').config({ path: '.env.local' });
const { MongoClient, ServerApiVersion } = require('mongodb');

// 从环境变量获取连接字符串
const uri = process.env.MONGODB_URI;

// 创建 MongoClient 实例
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    console.log("正在连接到 MongoDB...");
    
    // 连接到服务器
    await client.connect();
    
    // 发送 ping 命令确认连接成功
    await client.db("admin").command({ ping: 1 });
    console.log("连接成功！已成功连接到 MongoDB!");
    
    // 获取数据库
    const db = client.db("file2web");
    console.log(`使用数据库: ${db.databaseName}`);
    
    // 创建测试集合
    const testCollection = db.collection("test");
    console.log(`使用集合: ${testCollection.collectionName}`);
    
    // 插入测试文档
    const result = await testCollection.insertOne({
      test: true,
      message: "MongoDB 原生驱动程序连接测试",
      createdAt: new Date()
    });
    
    console.log(`插入的文档 ID: ${result.insertedId}`);
    
    // 查询测试文档
    const doc = await testCollection.findOne({ test: true });
    console.log("查询结果:", doc);
    
    // 删除测试文档
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log("测试文档已删除");
    
    // 获取所有集合
    const collections = await db.collections();
    console.log("数据库中的集合:");
    for (const collection of collections) {
      console.log(`- ${collection.collectionName}`);
    }
    
    console.log("\n测试完成!");
  } finally {
    // 确保客户端关闭连接
    await client.close();
    console.log("连接已关闭");
  }
}

// 运行测试
run().catch(err => {
  console.error("连接错误:", err);
  process.exit(1);
}); 