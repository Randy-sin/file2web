import { MongoClient, ServerApiVersion } from 'mongodb';

// 从环境变量读取MongoDB连接信息
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://file2web:Minecraftxxl123@file2web.8qy0z.mongodb.net/file2web?retryWrites=true&w=majority";

async function testNoTlsConnection() {
  console.log('测试MongoDB无TLS连接...');
  
  // 创建最宽松的连接选项
  const clientOptions = {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: false,
      deprecationErrors: false,
    },
    connectTimeoutMS: 60000,
    socketTimeoutMS: 90000,
    tls: false,
    ssl: false
  };
  
  console.log('连接选项:', JSON.stringify(clientOptions, null, 2));
  
  // 创建MongoDB客户端
  const client = new MongoClient(MONGODB_URI, clientOptions);
  
  try {
    // 连接到MongoDB
    console.log('尝试连接到MongoDB...');
    await client.connect();
    console.log('成功连接到MongoDB!');
    
    // 获取数据库
    const db = client.db('file2web');
    console.log(`成功获取数据库: ${db.databaseName}`);
    
    // 获取集合列表
    const collections = await db.listCollections({}, { nameOnly: true }).toArray();
    console.log(`数据库中的集合数量: ${collections.length}`);
    
    // 显示所有集合
    if (collections.length > 0) {
      console.log('集合列表:');
      for (const collection of collections) {
        console.log(`- ${collection.name}`);
      }
    } else {
      console.log('数据库中没有集合');
    }
    
    // 尝试读取website集合中的文档
    if (collections.some(c => c.name === 'websites')) {
      const websites = await db.collection('websites').find({}).limit(1).toArray();
      console.log(`网站数量: ${websites.length}`);
      if (websites.length > 0) {
        console.log('样本网站ID:', websites[0].urlId || websites[0]._id);
      }
    }
    
    // 发送ping命令确认连接成功
    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB连接正常: ping成功");
    
    console.log('\n测试完成，连接成功!');
  } catch (error) {
    console.error('连接失败:', error);
    
    if (error instanceof Error) {
      console.error('错误类型:', error.name);
      console.error('错误信息:', error.message);
      console.error('错误堆栈:', error.stack);
      
      // 检查是否有嵌套错误
      if ('cause' in error && error.cause instanceof Error) {
        console.error('原始错误:', error.cause);
      }
    }
  } finally {
    // 关闭连接
    await client.close();
    console.log('MongoDB连接已关闭');
    process.exit(0);
  }
}

// 执行测试
testNoTlsConnection(); 