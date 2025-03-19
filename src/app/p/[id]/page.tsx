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
  
  // 提取HTML内容
  const htmlContent = mainFile.content;
  
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