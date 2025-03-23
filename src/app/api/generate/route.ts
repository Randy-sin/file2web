// 设置API路由的最大执行时间为300秒（5分钟）
export const maxDuration = 300;

import { NextResponse } from 'next/server';

// 设置超时时间为 1800 秒（30分钟）
const TIMEOUT_MS = 1800000;

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

// 导入模板系统
import { ContentType, DesignStylePreset, templateManager } from '@/lib/prompts';
import { presetProvider } from '@/lib/prompts/presets';

// 标准模式提示词 - 保留旧版注释以便参考
// const standardPrompt = (text: string) => `...`;

// 高精度模式提示词 - 保留旧版注释以便参考
// const highPerformancePrompt = (text: string) => `...`;

// 不再创建新实例，使用已注册模板的实例
// const templateManager = new TemplateManager();

export async function POST(request: Request) {
  try {
    const { text, designStyle, contentType } = await request.json();

    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: '请提供文本内容' },
        { status: 400 }
      );
    }

    // 检查文本长度，如果过长，给出明确提示
    if (text.length > 10000) {
      return NextResponse.json(
        { 
          error: `文本内容过长(${text.length}字符)，超过处理能力。请减少文本量再试。`,
          textLength: text.length
        },
        { status: 413 } // Payload Too Large
      );
    }

    console.log('收到生成请求，文本长度:', text.length);

    // 自动检测内容类型（如果未提供）
    const detectedContentType = contentType || presetProvider.detectContentType(text);
    console.log('内容类型:', detectedContentType);
    
    // 使用指定的设计风格或从内容类型获取默认值
    const stylePreset = designStyle || presetProvider.getContentTypeConfig(detectedContentType).designStyle;
    console.log('设计风格:', stylePreset);

    // 选择模板
    let promptText;
    const template = templateManager.get('standard');
    if (template) {
      promptText = template.render(text);
    }

    // 如果模板不存在，使用自动选择
    if (!promptText) {
      const template = templateManager.autoSelect(text);
      promptText = template.render(text);
    }

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
            ],
            temperature: 0.5,
            max_tokens: 8000
          })
        },
        TIMEOUT_MS
      );

      console.log('Monica API响应状态:', response.status);

      if (!response.ok) {
        let errorData;
        // 先克隆响应，避免多次读取导致错误
        const responseClone = response.clone();
        
        try {
          errorData = await response.json();
        } catch (e) {
          // 如果响应不是JSON格式，尝试使用克隆的响应获取文本内容
          try {
            const textContent = await responseClone.text();
            console.error('Monica AI API返回非JSON响应:', textContent);
            errorData = { error: `API响应格式错误: ${response.status} ${response.statusText}` };
          } catch (textError) {
            console.error('无法读取响应内容:', textError);
            errorData = { error: `API响应读取失败: ${response.status} ${response.statusText}` };
          }
        }
        
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
        } else if (response.status === 504) {
          errorMessage = 'AI服务处理超时，请尝试减少文本量或稍后再试';
          statusCode = 504;
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
          
          // 标准模式直接返回内容
          return NextResponse.json({ html: htmlContent });
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
    } catch (error) {
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
            suggestion: '建议减少文本量再试'
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