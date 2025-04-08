import { NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';

// 标记为动态路由，防止在构建时预生成
export const dynamic = 'force-dynamic';

/**
 * 测试数据库连接API
 * GET /api/test-db
 */
export async function GET() {
  try {
    console.log('开始测试数据库连接...');
    
    // 尝试连接数据库
    await connectToDatabase();
    
    // 获取数据库实例
    const db = await getDatabase("file2web");
    
    // 执行简单的ping命令
    const admin = await getDatabase("admin");
    const pingResult = await admin.command({ ping: 1 });
    
    // 获取数据库信息
    let dbInfo;
    try {
      dbInfo = await db.stats();
    } catch (statsError) {
      console.error('获取数据库统计信息失败:', statsError);
      dbInfo = { collections: 0, views: 0, objects: 0 };
    }
    
    // 获取集合列表
    let collections = [];
    let collectionNames = [];
    try {
      collections = await db.listCollections({}, { nameOnly: true }).toArray();
      collectionNames = collections.map(col => col.name);
    } catch (listError) {
      console.error('获取集合列表失败:', listError);
      collectionNames = ['无法获取集合列表'];
    }
    
    return NextResponse.json({
      success: true,
      message: '数据库连接成功',
      ping: pingResult,
      dbInfo: {
        dbName: db.databaseName,
        collections: collectionNames,
        stats: {
          collections: dbInfo.collections || 0,
          views: dbInfo.views || 0,
          objects: dbInfo.objects || 0,
          avgObjSize: dbInfo.avgObjSize || 0,
          dataSize: dbInfo.dataSize || 0,
          storageSize: dbInfo.storageSize || 0,
          indexes: dbInfo.indexes || 0,
          indexSize: dbInfo.indexSize || 0
        }
      }
    });
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    
    return NextResponse.json({
      success: false,
      message: `数据库连接失败: ${error instanceof Error ? error.message : String(error)}`,
      error: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
} 