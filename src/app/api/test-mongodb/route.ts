import { NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';

// 标记为动态路由，防止在构建时预生成
export const dynamic = 'force-dynamic';

/**
 * 测试MongoDB连接API
 * GET /api/test-mongodb
 */
export async function GET() {
  try {
    console.log('开始测试MongoDB连接...');
    
    // 使用改进的连接方法
    await connectToDatabase();
    console.log("MongoDB连接成功！");
    
    // 获取数据库信息
    const db = await getDatabase("file2web");
    
    // 发送ping命令确认连接成功
    const admin = await getDatabase("admin");
    await admin.command({ ping: 1 });
    console.log("成功ping通MongoDB部署。");
    
    // 获取数据库统计信息
    let dbInfo;
    try {
      dbInfo = await db.stats();
    } catch (statsError) {
      console.error('获取数据库统计信息失败:', statsError);
      dbInfo = { collections: 0, objects: 0, dataSize: 0, storageSize: 0 };
    }
    
    // 获取集合列表
    let collectionNames = [];
    try {
      const collections = await db.listCollections({}, { nameOnly: true }).toArray();
      collectionNames = collections.map(col => col.name);
    } catch (listError) {
      console.error('获取集合列表失败:', listError);
      collectionNames = ['无法获取集合列表'];
    }
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB连接成功',
      dbInfo: {
        dbName: db.databaseName,
        collections: collectionNames,
        stats: {
          collections: dbInfo.collections || 0,
          objects: dbInfo.objects || 0,
          dataSize: dbInfo.dataSize || 0,
          storageSize: dbInfo.storageSize || 0
        }
      }
    });
  } catch (error) {
    console.error('MongoDB连接测试失败:', error);
    
    return NextResponse.json({
      success: false,
      message: `MongoDB连接失败: ${error instanceof Error ? error.message : String(error)}`,
      error: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
} 