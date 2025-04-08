import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { connectToDatabase, getCollection } from '@/lib/mongodb';

// 标记为动态路由，防止在构建时预生成
export const dynamic = 'force-dynamic';
// 设置最大执行时间为60秒（Vercel限制）
export const maxDuration = 60;

// 定义文件接口
interface FileData {
  name: string;
  content: string;
}

/**
 * 存储网页内容API
 * POST /api/website
 * 
 * 请求体:
 * {
 *   title?: string,
 *   html: string,
 *   isMultiFile?: boolean,
 *   files?: Array<{name: string, content: string}>
 * }
 * 
 * 响应:
 * {
 *   success: boolean,
 *   urlId: string,
 *   url: string,
 *   message?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    
    // 验证请求数据
    if (!body.html && (!body.files || body.files.length === 0)) {
      return NextResponse.json(
        { success: false, message: '请提供HTML内容或文件列表' },
        { status: 400 }
      );
    }
    
    // 准备文件数据
    let files: FileData[] = [];
    if (body.isMultiFile && body.files && body.files.length > 0) {
      files = body.files;
    } else {
      // 单文件模式，创建index.html
      files = [{ name: 'index.html', content: body.html }];
    }
    
    // 确保所有文件都有内容
    const invalidFiles = files.filter((file: FileData) => !file.content || file.content.trim() === '');
    if (invalidFiles.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `以下文件内容为空: ${invalidFiles.map((f: FileData) => f.name).join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // 使用共享的MongoDB连接函数，添加超时控制
    try {
      await Promise.race([
        connectToDatabase(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('MongoDB连接超时')), 10000)
        )
      ]);
      console.log('MongoDB连接成功，准备保存网页内容...');
    } catch (dbError) {
      console.error('MongoDB连接失败:', dbError);
      return NextResponse.json(
        { success: false, message: '数据库连接超时，请稍后再试' },
        { status: 503 }
      );
    }
    
    // 获取数据库集合
    const websitesCollection = await getCollection('websites');
    
    // 生成唯一ID
    const urlId = nanoid(10);
    
    // 创建网站文档
    const website = {
      urlId: urlId,
      title: body.title || '未命名网页',
      isMultiFile: !!body.isMultiFile,
      files: files,
      views: 0,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后过期
    };
    
    // 保存到数据库
    await websitesCollection.insertOne(website);
    console.log(`网页内容已保存，ID: ${urlId}`);
    
    // 构建URL
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const url = `${protocol}://${host}/preview/${urlId}`;
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      urlId: urlId,
      url: url,
      message: '网页已成功保存'
    });
    
  } catch (error) {
    console.error('保存网页失败:', error);
    
    // 返回错误响应
    return NextResponse.json(
      { 
        success: false, 
        message: `保存网页失败: ${error instanceof Error ? error.message : String(error)}` 
      },
      { status: 500 }
    );
  }
} 