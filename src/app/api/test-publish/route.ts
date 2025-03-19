import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { connectToDatabase, getCollection } from '@/lib/mongodb';

// 标记为动态路由，防止在构建时预生成
export const dynamic = 'force-dynamic';

/**
 * 测试网页发布功能API
 * GET /api/test-publish
 */
export async function GET() {
  try {
    console.log('开始测试网页发布功能...');
    
    // 使用改进的MongoDB连接
    await connectToDatabase();
    console.log("MongoDB连接成功！");
    
    // 获取网站集合
    const websitesCollection = await getCollection("websites");
    
    // 创建测试网页内容
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>测试网页</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1>测试网页</h1>
          <p>这是一个测试网页，用于验证网页发布功能是否正常工作。</p>
          <p>生成时间: ${new Date().toLocaleString()}</p>
          <p>随机ID: ${Math.random().toString(36).substring(2, 15)}</p>
        </body>
      </html>
    `;
    
    // 创建网站文档
    const urlId = nanoid(10); // 生成10位的唯一ID
    const website = {
      urlId: urlId,
      title: '测试网页 - ' + new Date().toLocaleString(),
      isMultiFile: false,
      files: [{ name: 'index.html', content: testHtml }],
      views: 0,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后过期
    };
    
    // 保存到数据库
    let result;
    try {
      result = await websitesCollection.insertOne(website);
      console.log(`测试网页已保存，ID: ${urlId}`);
    } catch (insertError) {
      console.error('保存测试网页失败:', insertError);
      return NextResponse.json({
        success: false,
        message: `保存测试网页失败: ${insertError instanceof Error ? insertError.message : String(insertError)}`
      }, { status: 500 });
    }
    
    // 构建URL
    const url = `/preview/${urlId}`;
    
    return NextResponse.json({
      success: true,
      message: '测试网页发布成功',
      website: {
        id: result.insertedId.toString(),
        urlId: urlId,
        title: website.title,
        url: url,
        createdAt: website.createdAt
      }
    });
  } catch (error) {
    console.error('测试网页发布失败:', error);
    
    return NextResponse.json({
      success: false,
      message: `测试网页发布失败: ${error instanceof Error ? error.message : String(error)}`,
      error: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
} 