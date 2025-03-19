import { connectToDatabase, getDatabase, getCollection } from './src/lib/mongodb';
import { ObjectId, Filter, Document } from 'mongodb';

async function testConnection() {
  try {
    console.log('正在连接到 MongoDB...');
    
    // 连接到数据库
    const client = await connectToDatabase();
    console.log('成功连接到 MongoDB!');
    
    // 获取数据库
    const db = await getDatabase();
    console.log(`使用数据库: ${db.databaseName}`);
    
    // 获取集合
    const testCollection = await getCollection('test');
    console.log(`使用集合: test`);
    
    // 插入测试文档
    const result = await testCollection.insertOne({
      test: true,
      message: '使用原生驱动程序的 MongoDB 连接测试',
      createdAt: new Date()
    });
    console.log(`插入的文档 ID: ${result.insertedId.toString()}`);
    
    // 查询测试文档
    const doc = await testCollection.findOne({ test: true });
    console.log('查询结果:', doc);
    
    // 删除测试文档 - 使用类型断言绕过类型检查
    const deleteFilter = { _id: result.insertedId } as Filter<Document>;
    await testCollection.deleteOne(deleteFilter);
    console.log('测试文档已删除');
    
    // 获取所有集合
    const collections = await db.listCollections({}, { nameOnly: true }).toArray();
    console.log('数据库中的集合:');
    for (const collection of collections) {
      console.log(`- ${collection.name}`);
    }
    
    console.log('\n测试完成!');
    process.exit(0);
  } catch (error) {
    console.error('连接失败:', error);
    process.exit(1);
  }
}

// 执行测试
testConnection(); 