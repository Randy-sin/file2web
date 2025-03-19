import { NextResponse } from 'next/server';

// 设置超时时间为 600 秒（10分钟）
const TIMEOUT_MS = 600000;

// 创建一个带超时的 fetch 函数
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// 标准模式提示词
const standardPrompt = (text: string) => `我会给你一个文本，分析内容，并将其转化为美观漂亮的中文可视化网页：

## 内容要求
- 所有页面内容必须为简体中文
- 保持原文件的核心信息，但以更易读、可视化的方式呈现
- 在页面底部添加作者信息区域，包含：
  * 作者姓名: [作者姓名]
  * 社交媒体链接: 至少包含GitHub、Twitter/X、LinkedIn等主流平台
  * 版权信息和年份

## 设计风格
- 整体风格参考Linear App的简约现代设计
- 使用清晰的视觉层次结构，突出重要内容
- 配色方案应专业、和谐，适合长时间阅读

## 技术规范
- 使用HTML5、TailwindCSS 3.0+（通过CDN引入）和必要的JavaScript
- 代码结构清晰，包含适当注释，便于理解和维护

## 响应式设计
- 页面必须在所有设备上（手机、平板、桌面）完美展示
- 针对不同屏幕尺寸优化布局和字体大小
- 确保移动端有良好的触控体验

## 图标与视觉元素
- 使用专业图标库如Font Awesome或Material Icons（通过CDN引入）
- 根据内容主题选择合适的插图或图表展示数据
- 避免使用emoji作为主要图标

## 交互体验
- 添加适当的微交互效果提升用户体验：
  * 按钮悬停时有轻微放大和颜色变化
  * 卡片元素悬停时有精致的阴影和边框效果
  * 页面滚动时有平滑过渡效果
  * 内容区块加载时有优雅的淡入动画

## 性能优化
- 确保页面加载速度快，避免不必要的大型资源
- 图片使用现代格式(WebP)并进行适当压缩
- 实现懒加载技术用于长页面内容

## 输出要求
- 提供完整可运行的单一HTML文件，包含所有必要的CSS和JavaScript
- 确保代码符合W3C标准，无错误警告
- 页面在不同浏览器中保持一致的外观和功能

以下是需要转换的文本内容：

${text}

请根据上述文本的内容，创建最适合展示该内容的可视化网页，保证文本全部内容都能显示在网页上。请直接返回完整的HTML代码，不要包含任何其他解释或说明。`;

// 高精度模式提示词
const highPerformancePrompt = (text: string) => `我会给你一个文本，请将其转化为一个由多个互联HTML文件组成的精美可视化网站：

## 内容组织要求
- 分析文本内容，将其智能拆分为多个逻辑相关的部分
- 创建一个index.html作为主入口，包含导航菜单和内容概览
- 为每个主要部分创建单独的HTML文件（如chapter1.html, chapter2.html等）
- 确保所有页面内容为简体中文
- 保持原文本的核心信息，但以更易读、可视化的方式呈现
- 在每个页面底部添加作者信息区域，包含：
  * 作者姓名: [作者姓名]
  * 社交媒体链接: 至少包含GitHub、Twitter/X、LinkedIn等主流平台
  * 版权信息和年份

## 导航与链接
- 在index.html中创建清晰的导航菜单，链接到所有内容页面
- 在每个内容页面顶部添加导航栏，可以返回主页和访问其他页面
- 在每个页面底部添加"上一页"和"下一页"链接
- 为相关内容添加内部链接，增强内容关联性

## 设计风格
- 整体风格参考Linear App的简约现代设计
- 使用清晰的视觉层次结构，突出重要内容
- 配色方案应专业、和谐，适合长时间阅读
- 所有页面保持一致的设计语言和布局结构

## 内容增强
- 识别关键概念，为其添加简短解释或定义
- 将长列表转换为分类展示或卡片式布局
- 为数据部分创建简单的可视化图表
- 为复杂概念添加简化说明或图示
- 根据内容主题添加相关的图标或插图

## 技术规范
- 使用HTML5、TailwindCSS 3.0+（通过CDN引入）和必要的JavaScript
- 代码结构清晰，包含适当注释，便于理解和维护

## 响应式设计
- 所有页面必须在各种设备上（手机、平板、桌面）完美展示
- 针对不同屏幕尺寸优化布局和字体大小
- 确保移动端有良好的触控体验
- 在小屏幕设备上优化导航菜单为折叠式

## 图标与视觉元素
- 使用专业图标库如Font Awesome或Material Icons（通过CDN引入）
- 根据内容主题选择合适的插图或图表展示数据
- 避免使用emoji作为主要图标
- 为每个主要部分选择代表性的图标

## 交互体验
- 添加适当的微交互效果提升用户体验：
  * 按钮悬停时有轻微放大和颜色变化
  * 卡片元素悬停时有精致的阴影和边框效果
  * 页面切换时有平滑过渡效果
  * 内容区块加载时有优雅的淡入动画
- 实现页面间的平滑切换效果

## 性能优化
- 确保页面加载速度快，避免不必要的大型资源
- 图片使用现代格式(WebP)并进行适当压缩
- 实现懒加载技术用于长页面内容
- 优化JavaScript代码，避免阻塞渲染

## 输出要求
- 提供完整的多文件网站，包括index.html和所有内容页面
- 所有文件应放在同一目录下，使用相对路径链接
- 确保代码符合W3C标准，无错误警告
- 所有页面在不同浏览器中保持一致的外观和功能

以下是需要转换的文本内容：

${text}

请根据上述文本的内容，创建一个由多个HTML文件组成的完整网站，确保文本全部内容都能以最佳方式展示。请直接返回所有HTML文件的完整代码，每个文件之间使用明确的分隔符标识。`;

export async function POST(request: Request) {
  try {
    const { text, isHighPerformance = false } = await request.json();

    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: '请提供文本内容' },
        { status: 400 }
      );
    }

    // 检查文本长度，如果过长且不是高精度模式，给出明确提示
    if (!isHighPerformance && text.length > 10000) {
      return NextResponse.json(
        { 
          error: `文本内容过长(${text.length}字符)，超过标准模式处理能力。请减少文本量或切换到高精度模式。`,
          textLength: text.length
        },
        { status: 413 } // Payload Too Large
      );
    }

    console.log('收到生成请求，文本长度:', text.length, '高精度模式:', isHighPerformance);

    // 根据模式选择提示词
    const promptText = isHighPerformance ? highPerformancePrompt(text) : standardPrompt(text);

    // 调用Monica AI API，使用带超时的 fetch
    try {
      const response = await fetchWithTimeout(
        'https://openapi.monica.im/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MONICA_API_KEY}`
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: promptText
                  }
                ]
              }
            ]
          })
        },
        TIMEOUT_MS
      );

      console.log('Monica API响应状态:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Monica AI API错误:', errorData);
        
        // 根据不同状态码返回不同的错误信息
        let errorMessage = '生成网页时出错';
        let statusCode = 500;
        
        if (response.status === 401 || response.status === 403) {
          errorMessage = 'API授权失败，请联系管理员检查API配置';
          statusCode = 401;
        } else if (response.status === 429) {
          errorMessage = 'API请求频率超限，请稍后再试';
          statusCode = 429;
        } else if (response.status >= 500) {
          errorMessage = 'AI服务器暂时响应异常，请稍后再试';
          statusCode = 502;
        }
        
        return NextResponse.json(
          { error: errorMessage },
          { status: statusCode }
        );
      }

      const data = await response.json();
      console.log('Monica API响应数据结构:', Object.keys(data));
      
      // 从API响应中提取HTML内容
      try {
        // 根据日志中的实际响应格式进行解析
        if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
          const htmlContent = data.choices[0].message.content;
          console.log('提取的HTML内容长度:', htmlContent.length);
          
          // 如果是高精度模式，尝试解析多个HTML文件
          if (isHighPerformance) {
            // 尝试解析多个HTML文件
            const files = parseMultipleHtmlFiles(htmlContent);
            if (files.length > 0) {
              console.log(`成功解析${files.length}个HTML文件`);
              return NextResponse.json({ 
                html: files[0].content, // 返回主文件内容用于兼容
                files: files, // 返回所有文件
                isMultiFile: true 
              });
            } else {
              console.log('无法解析多个HTML文件，回退到单文件模式');
              return NextResponse.json({ html: htmlContent });
            }
          } else {
            // 标准模式直接返回内容
            return NextResponse.json({ html: htmlContent });
          }
        } else {
          // 尝试直接从响应中提取HTML内容
          console.log('尝试备用方法提取HTML内容');
          const responseText = JSON.stringify(data);
          // 查找HTML标记
          if (responseText.includes('<!DOCTYPE html>') || responseText.includes('<html')) {
            const startIndex = responseText.indexOf('<!DOCTYPE html>') !== -1 
              ? responseText.indexOf('<!DOCTYPE html>') 
              : responseText.indexOf('<html');
            
            const endIndex = responseText.lastIndexOf('</html>') + '</html>'.length;
            
            if (startIndex !== -1 && endIndex !== -1) {
              const htmlContent = responseText.substring(startIndex, endIndex);
              console.log('通过备用方法提取的HTML内容长度:', htmlContent.length);
              return NextResponse.json({ html: htmlContent });
            }
          }
          
          throw new Error('无法从响应中提取HTML内容');
        }
      } catch (error) {
        console.error('提取HTML内容时出错:', error);
        console.error('完整响应:', JSON.stringify(data));
        
        // 最后尝试直接从message.content字符串中提取
        if (data.choices && 
            data.choices[0] && 
            data.choices[0].message && 
            typeof data.choices[0].message.content === 'string') {
          
          const content = data.choices[0].message.content;
          console.log('直接使用字符串内容，长度:', content.length);
          return NextResponse.json({ html: content });
        }
        
        return NextResponse.json(
          { error: 'API响应格式不符合预期' },
          { status: 500 }
        );
      }
    } catch (error: unknown) {
      // 处理超时错误
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Monica AI API请求超时');
        
        // 根据文本长度给出更具体的错误建议
        let errorMessage = 'API请求超时';
        
        if (text.length > 10000) {
          errorMessage = `文本内容过长(${text.length}字符)导致处理超时，请减少文本量(建议5000字以内)或使用高精度模式`;
        } else if (text.length > 5000) {
          errorMessage = `文本内容较长(${text.length}字符)可能导致处理超时，请尝试减少文本量或使用高精度模式`;
        } else {
          errorMessage = 'API请求处理超时，可能是因为服务负载较高，请稍后再试或尝试高精度模式';
        }
        
        return NextResponse.json(
          { 
            error: errorMessage,
            textLength: text.length,
            suggestion: isHighPerformance ? '文本过长，请减少文本量再试' : '建议切换到高精度模式或减少文本量'
          },
          { status: 504 }
        );
      }
      
      // 处理网络连接错误
      if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network'))) {
        console.error('网络连接错误:', error.message);
        return NextResponse.json(
          { error: '网络连接问题，无法访问AI服务，请检查网络连接后重试' },
          { status: 503 }
        );
      }
      
      console.error('调用Monica AI API时出错:', error);
      return NextResponse.json(
        { error: '调用AI服务时出错，请稍后再试' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('生成网页时出错:', error);
    
    // 检查是否是JSON解析错误
    const errorMessage = error instanceof Error && error.message.includes('JSON') 
      ? '请求格式错误，无法解析JSON内容' 
      : '服务器内部错误，请稍后再试';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: error instanceof Error && error.message.includes('JSON') ? 400 : 500 }
    );
  }
}

// 解析多个HTML文件
function parseMultipleHtmlFiles(content: string): Array<{name: string, content: string}> {
  const files: Array<{name: string, content: string}> = [];
  
  // 尝试查找常见的文件分隔符
  const commonSeparators = [
    /```html\s+(.+?\.html)\s+([\s\S]+?)```/g,
    /---\s+FILE:\s+(.+?\.html)\s+---\s+([\s\S]+?)(?=---\s+FILE:|$)/g,
    /==== (.+?\.html) ====\s+([\s\S]+?)(?====|$)/g,
    /<!-- FILE: (.+?\.html) -->\s+([\s\S]+?)(?=<!-- FILE:|$)/g
  ];
  
  for (const separator of commonSeparators) {
    let match;
    let foundAny = false;
    
    while ((match = separator.exec(content)) !== null) {
      foundAny = true;
      const fileName = match[1].trim();
      const fileContent = match[2].trim();
      
      if (fileName && fileContent) {
        files.push({
          name: fileName,
          content: fileContent
        });
      }
    }
    
    if (foundAny) break; // 如果找到了匹配项，就不再尝试其他分隔符
  }
  
  // 如果没有找到任何文件，但内容包含HTML标记，则假设它是单个index.html文件
  if (files.length === 0 && (content.includes('<!DOCTYPE html>') || content.includes('<html'))) {
    files.push({
      name: 'index.html',
      content: content
    });
  }
  
  return files;
} 