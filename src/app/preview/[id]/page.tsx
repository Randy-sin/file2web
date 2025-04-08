import { notFound } from 'next/navigation';
import { connectToDatabase, getCollection } from '@/lib/mongodb';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// 定义文件接口
interface WebsiteFile {
  name: string;
  content: string;
}

// 定义网站接口
interface Website {
  urlId: string;
  title: string;
  files: WebsiteFile[];
  isMultiFile: boolean;
  views: number;
  createdAt: Date;
  lastAccessedAt?: Date;
  expiresAt?: Date;
}

/**
 * 获取网页数据
 */
async function getWebsite(id: string): Promise<Website | null> {
  try {
    // 使用共享的MongoDB连接
    await connectToDatabase();
    
    // 获取网站集合
    const websitesCollection = await getCollection('websites');
    
    // 查找网站
    const website = await websitesCollection.findOne({ urlId: id });
    
    if (!website) {
      return null;
    }
    
    // 更新访问统计
    await websitesCollection.updateOne(
      { urlId: id },
      { 
        $inc: { views: 1 },
        $set: { lastAccessedAt: new Date() }
      }
    );
    
    return website as unknown as Website;
  } catch (error) {
    console.error('获取网页数据失败:', error);
    return null;
  }
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
 * 网页渲染页面
 */
export default async function WebsitePage({ params }: PageProps) {
  // 确保params是已解析的对象
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  const website = await getWebsite(id);
  
  if (!website) {
    notFound();
  }
  
  // 获取主文件（index.html或第一个文件）
  const mainFile = website.files.find((file: WebsiteFile) => file.name === 'index.html') || website.files[0];
  
  // 处理HTML内容
  let htmlContent;
  
  if (website.isMultiFile && website.files.length > 1) {
    // 多文件模式：将CSS和JS内联到HTML中
    htmlContent = createPreviewHtml(mainFile, website.files, id);
  } else {
    // 单文件模式：直接使用HTML内容
    htmlContent = mainFile.content;
  }
  
  // 使用iframe渲染HTML内容，避免hydration错误
  return (
      <iframe 
      srcDoc={htmlContent}
      style={{ 
        width: '100%', 
        height: '100vh', 
        border: 'none',
        position: 'absolute',
        top: 0,
        left: 0
      }}
      title={website.title || '网页内容'}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  );
}

/**
 * 生成元数据
 */
export async function generateMetadata({ params }: PageProps) {
  // 确保params是已解析的对象
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  const website = await getWebsite(id);
  
  if (!website) {
    return {
      title: '网页未找到',
      description: '请求的网页不存在或已被删除'
    };
  }
  
  return {
    title: website.title || '未命名网页',
    description: `由File2Web生成的网页 - 访问次数: ${website.views}`,
    openGraph: {
      title: website.title || '未命名网页',
      description: `由File2Web生成的网页 - 访问次数: ${website.views}`,
      type: 'website'
    }
  };
} 