import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getCollection } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 获取URL中的ID参数 - 使用await解析Promise
  const { id } = await params;
  
  if (!id) {
    return NextResponse.json(
      { success: false, message: '请提供网页ID' },
      { status: 400 }
    );
  }
  
  try {
    // 使用共享的MongoDB连接
    await connectToDatabase();
    console.log('MongoDB连接成功，准备获取网页内容...');
    
    // 获取网站集合
    const websitesCollection = await getCollection('websites');
    
    // 查找网站
    const website = await websitesCollection.findOne({ urlId: id });
    
    if (!website) {
      return NextResponse.json(
        { success: false, message: '未找到指定网页' },
        { status: 404 }
      );
    }
    
    // 更新访问统计
    await websitesCollection.updateOne(
      { urlId: id },
      { 
        $inc: { views: 1 },
        $set: { lastAccessedAt: new Date() }
      }
    );
    
    // 返回网站数据
    return NextResponse.json({
      success: true,
      website: {
        urlId: website.urlId,
        title: website.title,
        isMultiFile: website.isMultiFile,
        files: website.files,
        createdAt: website.createdAt,
        views: website.views
      }
    });
  } catch (error) {
    console.error('获取网页失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `获取网页失败: ${error instanceof Error ? error.message : String(error)}` 
      },
      { status: 500 }
    );
  }
} 