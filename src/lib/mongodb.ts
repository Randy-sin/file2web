import { MongoClient, ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';

// 从环境变量读取MongoDB连接信息
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://file2web:Minecraftxxl123@file2web.8qy0z.mongodb.net/file2web?appName=File2web";

// 根据环境确定连接选项
const getConnectionOptions = () => {
  // 检查当前环境
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';
  // 不需要显式检查production环境，用作默认情况
  
  console.log(`当前运行环境: ${process.env.NODE_ENV || '未指定'}`);
  
  // 定义MongoClientOptions类型的接口
  interface MongoConnectionOptions {
    serverApi: {
      version: typeof ServerApiVersion.v1;
      strict: boolean;
      deprecationErrors: boolean;
    };
    maxPoolSize?: number;
    connectTimeoutMS?: number;
    socketTimeoutMS?: number;
    tls?: boolean;
    tlsAllowInvalidCertificates?: boolean;
    tlsInsecure?: boolean;
  }
  
  // 基础选项 - 适用于所有环境
  const baseOptions: MongoConnectionOptions = {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    maxPoolSize: 10,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  };
  
  // 开发环境 - 严格验证但超时较短
  if (isDevelopment) {
    return {
      ...baseOptions,
      tls: true,
    };
  }
  
  // 测试环境 - 禁用严格验证
  if (isTest) {
    return {
      ...baseOptions,
      tls: true,
      tlsAllowInvalidCertificates: true,
    };
  }
  
  // 生产环境 - 使用简化连接选项（根据测试结果）
  return {
    ...baseOptions, // 保留基础选项
    serverApi: {
      version: ServerApiVersion.v1,
      strict: false, // 禁用严格模式
      deprecationErrors: false, // 禁用弃用错误
    },
    connectTimeoutMS: 60000, // 增加连接超时
    socketTimeoutMS: 60000,  // 增加socket超时
    // 不指定TLS/SSL选项，使用MongoDB驱动默认行为
  } as MongoConnectionOptions; // 使用类型断言
};

// 全局变量用于缓存MongoDB连接
// 在TypeScript中，全局声明需要使用var
/* eslint-disable no-var */
declare global {
  var mongoClient: MongoClient | null;
  var mongooseConnection: typeof mongoose | null;
}
/* eslint-enable no-var */

// 初始化全局变量
if (!global.mongoClient) {
  global.mongoClient = null;
  global.mongooseConnection = null;
}

// 创建MongoDB客户端 - 使用环境特定的配置
const client = new MongoClient(MONGODB_URI, getConnectionOptions());

// 检测是否在Next.js构建过程中
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

/**
 * 连接到MongoDB数据库
 * 使用缓存避免在开发模式下重复连接
 */
export async function connectToDatabase() {
  // 在构建时跳过实际连接
  if (isBuildTime) {
    console.log('检测到构建环境，跳过MongoDB连接');
    return null;
  }
  
  try {
    // 如果已经有缓存的连接，直接返回
    if (global.mongoClient) {
      console.log('使用已缓存的MongoDB连接');
      return global.mongoClient;
    }

    console.log('创建新的MongoDB连接...');
    console.log('环境:', process.env.NODE_ENV);
    
    // 连接到MongoDB - 增加错误处理和多次重试
    try {
      await client.connect();
    } catch (connError) {
      console.error('MongoDB连接初始尝试失败，详细错误:', connError);
      
      // 首次重试 - 等待1秒
      console.log('第一次重试连接...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        await client.connect();
      } catch (retryError) {
        // 第二次重试 - 使用备用选项
        console.error('第一次重试失败，尝试第二次重试:', retryError);
        console.log('第二次重试，使用备用选项连接...');
        
        // 创建临时客户端，使用测试证实有效的简化选项
        const tempClient = new MongoClient(MONGODB_URI, {
          serverApi: { version: ServerApiVersion.v1, strict: false, deprecationErrors: false },
          connectTimeoutMS: 60000,
          socketTimeoutMS: 60000
          // 不指定TLS/SSL选项
        });
        
        try {
          await tempClient.connect();
          console.log('备用连接成功！');
          
          // 关闭原始客户端
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          try { await client.close(); } catch (_) {}
          
          // 使用成功的客户端
          global.mongoClient = tempClient;
          return tempClient;
        } catch (fallbackError) {
          console.error('所有连接尝试均失败:', fallbackError);
          throw fallbackError;
        }
      }
    }
    
    // 发送ping命令确认连接成功
    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB连接成功！已成功ping通部署。");
    
    // 缓存连接
    global.mongoClient = client;
    
    return client;
  } catch (error) {
    console.error('MongoDB连接失败（详细错误）:', error);
    if (error instanceof Error) {
      console.error('错误名称:', error.name);
      console.error('错误消息:', error.message);
      console.error('错误堆栈:', error.stack);
      // 检查是否有更深层次的错误
      if ('cause' in error) {
        console.error('原始错误:', error.cause);
      }
    }
    throw error;
  }
}

/**
 * 连接到MongoDB数据库（使用Mongoose）
 * 这个方法更适合与Mongoose模型一起使用
 */
export async function connectMongoose() {
  // 在构建时跳过实际连接
  if (isBuildTime) {
    console.log('检测到构建环境，跳过Mongoose连接');
    return mongoose;
  }
  
  try {
    // 如果已经有缓存的连接，直接返回
    if (global.mongooseConnection) {
      console.log('使用已缓存的Mongoose连接');
      return global.mongooseConnection;
    }

    console.log('创建新的Mongoose连接...');
    console.log(`当前运行环境: ${process.env.NODE_ENV || '未指定'}`);
    
    // 设置Mongoose连接选项
    mongoose.set('strictQuery', false);
    
    // 获取环境特定的连接选项
    const options = getConnectionOptions();
    
    // 定义Mongoose连接选项类型
    interface MongooseConnectionOptions {
      maxPoolSize?: number;
      connectTimeoutMS?: number;
      socketTimeoutMS?: number;
      ssl?: boolean;
      tls?: boolean;
      tlsAllowInvalidCertificates?: boolean;
    }

    // 连接到MongoDB，添加环境特定的选项
    const mongooseOptions: MongooseConnectionOptions = {
      maxPoolSize: options.maxPoolSize,
      connectTimeoutMS: options.connectTimeoutMS,
      socketTimeoutMS: options.socketTimeoutMS,
    };

    // 有条件地添加TLS选项 - 在生产环境中使用简化选项
    if (options.tls !== undefined && process.env.NODE_ENV === 'production') {
      // 在生产环境不设置TLS选项，使用MongoDB驱动默认行为
      // 根据测试，这是最可靠的连接方式
      delete mongooseOptions.tls;
      delete mongooseOptions.ssl;
    } else if (options.tls !== undefined) {
      // 开发环境正常使用TLS设置
      mongooseOptions.tls = options.tls;
      mongooseOptions.ssl = options.tls;
      
      if (options.tlsAllowInvalidCertificates) {
        mongooseOptions.tlsAllowInvalidCertificates = options.tlsAllowInvalidCertificates;
      }
    }

    await mongoose.connect(MONGODB_URI, mongooseOptions);
    
    console.log('Mongoose连接成功');
    global.mongooseConnection = mongoose;
    
    return mongoose;
  } catch (error) {
    console.error('Mongoose连接失败:', error);
    throw error;
  }
}

/**
 * 获取数据库实例
 */
export async function getDatabase(dbName = 'file2web') {
  // 在构建时返回模拟数据库对象
  if (isBuildTime) {
    console.log('检测到构建环境，返回模拟数据库对象');
    return {
      databaseName: dbName,
      collection: () => getMockCollection(),
      command: () => Promise.resolve({ ok: 1 }),
      listCollections: () => ({ toArray: () => Promise.resolve([]) }),
      stats: () => Promise.resolve({
        collections: 0, views: 0, objects: 0, dataSize: 0,
        storageSize: 0, indexes: 0, indexSize: 0, avgObjSize: 0
      })
    };
  }
  
  const client = await connectToDatabase();
  // 处理client可能为null的情况
  if (!client) {
    throw new Error('无法获取MongoDB客户端连接');
  }
  return client.db(dbName);
}

/**
 * 获取集合
 */
export async function getCollection(collectionName: string, dbName = 'file2web') {
  // 在构建时返回模拟集合对象
  if (isBuildTime) {
    console.log('检测到构建环境，返回模拟集合对象');
    return getMockCollection();
  }
  
  const db = await getDatabase(dbName);
  return db.collection(collectionName);
}

/**
 * 获取模拟集合对象，用于构建时
 */
function getMockCollection() {
  return {
    findOne: () => Promise.resolve(null),
    find: () => ({ toArray: () => Promise.resolve([]) }),
    insertOne: () => Promise.resolve({ insertedId: 'mock-id' }),
    updateOne: () => Promise.resolve({ modifiedCount: 1 }),
    deleteOne: () => Promise.resolve({ deletedCount: 1 }),
    countDocuments: () => Promise.resolve(0)
  };
}

/**
 * 关闭数据库连接
 */
export async function closeConnection() {
  if (global.mongoClient) {
    await global.mongoClient.close();
    global.mongoClient = null;
    console.log('MongoDB连接已关闭');
  }
  
  if (global.mongooseConnection) {
    await mongoose.disconnect();
    global.mongooseConnection = null;
    console.log('Mongoose连接已关闭');
  }
}

// 应用关闭时断开连接
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

// 确保在开发环境中的热重载不会导致多个连接
process.on('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
}); 