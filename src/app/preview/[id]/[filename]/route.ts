import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getCollection } from '@/lib/mongodb';

// 标记为动态路由，防止在构建时预生成
export const dynamic = 'force-dynamic';

// 定义文件接口
interface WebsiteFile {
  name: string;
  content: string;
}

/**
 * 将CSS和JS内联到HTML中，用于预览
 */
function createPreviewHtml(htmlFile: WebsiteFile, allFiles: WebsiteFile[], websiteId: string): string {
  // 获取HTML内容
  let htmlContent = htmlFile.content;
  
  // 查找CSS文件
  const cssFile = allFiles.find(file => file.name === 'styles.css');
  // 查找JS文件
  const jsFile = allFiles.find(file => file.name === 'scripts.js');
  
  // 如果HTML中已经包含了完整的DOCTYPE和HTML标签
  if (htmlContent.includes('<!DOCTYPE html>') && htmlContent.includes('<html')) {
    // 在</head>标签前插入内联CSS
    if (cssFile) {
      htmlContent = htmlContent.replace('</head>', `<style>${cssFile.content}</style></head>`);
    }
    
    // 在</body>标签前插入内联JS
    if (jsFile) {
      htmlContent = htmlContent.replace('</body>', `<script>${jsFile.content}</script></body>`);
    }
  } else {
    // 如果HTML不完整，创建一个完整的HTML结构
    let fullHtml = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>预览</title>\n';
    
    // 添加内联CSS
    if (cssFile) {
      fullHtml += `<style>${cssFile.content}</style>\n`;
    }
    
    fullHtml += '</head>\n<body>\n';
    
    // 添加HTML内容
    fullHtml += htmlContent;
    
    // 添加内联JS
    if (jsFile) {
      fullHtml += `\n<script>${jsFile.content}</script>\n`;
    }
    
    fullHtml += '\n</body>\n</html>';
    htmlContent = fullHtml;
  }
  
  // 修复相对路径引用
  // 将href="otherfile.html"替换为正确的相对路径
  allFiles.forEach(file => {
    if (file.name !== htmlFile.name && file.name.endsWith('.html')) {
      const fileName = file.name;
      // 使用正则表达式匹配href属性，确保只替换HTML文件引用
      const regex = new RegExp(`href=["']${fileName}["']`, 'g');
      // 替换为正确的路径
      htmlContent = htmlContent.replace(regex, `href="/preview/${websiteId}/${fileName}"`);
    }
  });
  
  return htmlContent;
}

/**
 * 处理多文件网站中的其他HTML文件请求
 * GET /preview/[id]/[filename]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; filename: string }> }
) {
  try {
    // 使用await解析params Promise
    const { id, filename } = await params;
    
    if (!id || !filename) {
      return NextResponse.json(
        { success: false, message: '请提供网页ID和文件名' },
        { status: 400 }
      );
    }
    
    // 使用共享的MongoDB连接
    await connectToDatabase();
    
    // 获取网站集合
    const websitesCollection = await getCollection('websites');
    
    // 查找网站
    const website = await websitesCollection.findOne({ urlId: id });
    
    if (!website) {
      return new NextResponse('网页未找到', { status: 404 });
    }
    
    // 查找请求的文件
    const requestedFile = website.files.find((file: { name: string }) => file.name === filename);
    
    if (!requestedFile) {
      return new NextResponse('文件未找到', { status: 404 });
    }
    
    // 将请求的文件转换为WebsiteFile类型
    const htmlFile: WebsiteFile = {
      name: requestedFile.name,
      content: requestedFile.content
    };
    
    // 处理HTML内容，使用改进的createPreviewHtml函数
    const htmlContent = createPreviewHtml(
      htmlFile,
      website.files,
      id
    );
    
    // 返回HTML内容
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  } catch (error) {
    console.error('获取文件失败:', error);
    return new NextResponse('服务器错误', { status: 500 });
  }
} 