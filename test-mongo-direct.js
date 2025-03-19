// 导入MongoDB库
const { MongoClient, ServerApiVersion } = require('mongodb');

// 直接使用连接字符串，不依赖环境变量
const MONGODB_URI = "mongodb+srv://file2web:Minecraftxxl123@file2web.8qy0z.mongodb.net/file2web?appName=File2web";

// 测试不同的连接选项
async function testMongoConnection() {
  console.log('开始测试MongoDB连接...');
  
  // 创建多种不同的连接选项
  const connectionOptions = [
    {
      name: "默认设置（不指定SSL/TLS选项）",
      options: {
        serverApi: { version: ServerApiVersion.v1, strict: false, deprecationErrors: false },
        connectTimeoutMS: 60000
      }
    },
    {
      name: "使用SSL，禁用证书验证",
      options: {
        serverApi: { version: ServerApiVersion.v1, strict: false, deprecationErrors: false },
        tls: true,
        ssl: true,
        tlsAllowInvalidCertificates: true,
        connectTimeoutMS: 60000
      }
    },
    {
      name: "使用directConnection选项",
      options: {
        serverApi: { version: ServerApiVersion.v1, strict: false, deprecationErrors: false },
        directConnection: true,
        connectTimeoutMS: 60000
      }
    },
    {
      name: "使用srv但禁用TLS",
      options: {
        serverApi: { version: ServerApiVersion.v1, strict: false, deprecationErrors: false },
        tls: false,
        connectTimeoutMS: 60000
      }
    },
    {
      name: "使用非标准连接字符串",
      options: {
        serverApi: { version: ServerApiVersion.v1, strict: false, deprecationErrors: false },
        connectTimeoutMS: 60000
      },
      uri: "mongodb://file2web:Minecraftxxl123@file2web.8qy0z.mongodb.net:27017/file2web"
    }
  ];
  
  // 逐个测试不同的连接选项
  for (const connConfig of connectionOptions) {
    console.log(`\n尝试连接方式: ${connConfig.name}`);
    console.log('连接选项:', JSON.stringify(connConfig.options, null, 2));
    
    // 使用配置中指定的URI或默认URI
    const uri = connConfig.uri || MONGODB_URI;
    if (connConfig.uri) {
      console.log('使用自定义URI:', uri);
    }
    
    const client = new MongoClient(uri, connConfig.options);
    
    try {
      // 尝试连接
      console.log('连接到MongoDB...');
      await client.connect();
      console.log('连接成功!');
      
      // 尝试Ping
      await client.db("admin").command({ ping: 1 });
      console.log('Ping成功!');
      
      // 获取集合列表
      const db = client.db("file2web");
      const collections = await db.listCollections({}, { nameOnly: true }).toArray();
      console.log(`找到 ${collections.length} 个集合`);
      
      if (collections.length > 0) {
        console.log('集合列表:');
        for (const coll of collections) {
          console.log(`- ${coll.name}`);
        }
      }
      
      // 成功找到工作的连接选项
      console.log(`\n=== 连接成功! 使用的选项: ${connConfig.name} ===\n`);
      
      // 将这些选项写入一个临时参考文件，以便将来使用
      const fs = require('fs');
      fs.writeFileSync('successful-mongo-config.json', JSON.stringify({
        connectionName: connConfig.name,
        options: connConfig.options,
        uri: connConfig.uri || "默认URI"
      }, null, 2));
      
      // 关闭连接
      await client.close();
      return true;
    } catch (error) {
      console.error(`连接失败 (${connConfig.name}):`, error.message);
      if (error.cause) {
        console.error('原始错误:', error.cause.message);
      }
      
      // 关闭连接并继续尝试下一个选项
      try {
        await client.close();
      } catch (e) {
        // 忽略关闭错误
      }
    }
  }
  
  console.log('\n所有连接选项均失败。请检查网络连接和MongoDB连接字符串。');
  return false;
}

// 运行测试
testMongoConnection()
  .then(success => {
    console.log('测试完成，结果:', success ? '成功' : '失败');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('测试过程中发生错误:', err);
    process.exit(1);
  }); 