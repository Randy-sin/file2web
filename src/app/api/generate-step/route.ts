import { NextResponse } from 'next/server';

// 设置超时时间为 600 秒（10分钟）
const TIMEOUT_MS = 600000;
// 最大重试次数
const MAX_RETRIES = 1;
// 重试延迟（毫秒）
const RETRY_DELAY = 800;

// 创建一个带超时和重试的 fetch 函数
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number, retries = MAX_RETRIES) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    console.log(`尝试请求 ${url}，剩余重试次数: ${retries}`);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    console.error(`请求失败: ${error instanceof Error ? error.message : 'unknown error'}`);
    
    // 如果还有重试次数，则延迟后重试
    if (retries > 0) {
      console.log(`${RETRY_DELAY}ms后重试...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithTimeout(url, options, timeout, retries - 1);
    }
    
    throw error;
  }
}

// 定义网站规划的类型
interface WebsitePlan {
  title: string;
  description: string;
  files: Array<{
    filename: string;
    title: string;
    description: string;
    content?: string;
  }>;
  [key: string]: unknown;
}

// 步骤1：内容分析和规划提示词
const planningPrompt = (text: string) => `我会给你一个文本，请分析内容并规划如何将其转化为一个视觉精美的网站：

## 任务
你的任务是分析文本内容，并规划如何将其拆分为少量HTML文件。请不要生成任何HTML代码，只需提供规划。

## 重要限制
1. 总文件数量不应超过3-5个（包括index.html）
2. index.html应该尽可能包含更多内容，成为内容的主要载体
3. 只有确实无法在主页面展示的大量详细内容才应该放到单独的页面中

## 规划要求
1. 分析文本内容，确定主题和逻辑结构
2. 规划如何将内容拆分为少量HTML文件（总数不超过5个）
3. 为每个文件指定一个合适的文件名和标题
4. 简要描述每个文件将包含的内容
5. 确定文件之间的导航关系，确保主页面是核心内容载体

## 输出格式
请以JSON格式输出你的规划，格式如下：
\`\`\`json
{
  "title": "网站总标题",
  "description": "网站简短描述",
  "files": [
    {
      "filename": "index.html",
      "title": "首页标题",
      "description": "这个文件包含主要内容，包括...",
      "content_sections": ["简介", "主要内容", "其他重要章节"]
    },
    {
      "filename": "details.html",
      "title": "详情页标题",
      "description": "这个文件包含无法在主页展示的大量细节内容...",
      "content_sections": ["详细内容1", "详细内容2"]
    }
    // 可能还有1-2个其他页面
  ]
}
\`\`\`

以下是需要分析的文本内容：

${text}

请根据上述文本的内容，提供一个合理的网站结构规划。记住，总文件数量应保持在3-5个之间，且index.html应包含尽可能多的核心内容。不要生成任何HTML代码，只需提供规划。`;

// 步骤2：生成主页提示词
const generateIndexPrompt = (text: string, plan: WebsitePlan) => `我会给你一个文本和网站规划，请根据规划生成网站的主页(index.html)：

## 网站规划
${JSON.stringify(plan, null, 2)}

## 重要设计要求
- 主页面(index.html)必须尽可能包含更多内容，是整个网站的核心
- 只有当确实无法在一个页面展示所有内容时，才使用其他页面链接
- 内容应该丰富、精美，包含大量可视化元素
- 实现多页面应用架构，通过传统的HTML链接实现页面间导航
- 所有页面必须共享相同的CSS样式和JavaScript文件，确保统一的界面风格

## 设计风格与视觉元素
- 整体风格参考Linear App的简约现代设计
- 使用清晰的视觉层次结构，突出重要内容
- 配色方案应专业、和谐，适合长时间阅读
- 大量使用适合内容的emoji、图标和视觉元素，提升页面设计感
- 为每个关键部分添加相关图标或可视化元素
- 使用Font Awesome图标库（通过CDN引入）丰富视觉表现
- 添加卡片设计、渐变色、阴影等现代设计元素
- 使用微动画和悬停效果增强交互体验

## 技术规范
- 使用HTML5、TailwindCSS 3.0+（通过CDN引入）和必要的JavaScript

- 将CSS和JavaScript提取到单独的文件中（styles.css和scripts.js），并在所有页面中引用
- 使用传统的<a href="页面名.html">链接方式实现页面导航，但添加过渡动画增强用户体验
- 添加以下代码到scripts.js，实现页面过渡效果:

\`\`\`javascript
// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 获取所有页面链接
  const pageLinks = document.querySelectorAll('a[href$=".html"]');
  
  // 为每个链接添加点击事件
  pageLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // 仅处理同域名下的链接
      if (this.hostname === window.location.hostname) {
        e.preventDefault();
        const targetPage = this.getAttribute('href');
        
        // 添加页面退出动画
        document.body.classList.add('page-exit');
        
        // 动画结束后加载新页面
        setTimeout(function() {
          window.location.href = targetPage;
        }, 300); // 300ms与CSS过渡时间匹配
      }
    });
  });
  
  // 页面加载时添加进入动画
  document.body.classList.add('page-enter');
});

// 保存当前页面滚动位置到sessionStorage
window.addEventListener('beforeunload', function() {
  sessionStorage.setItem('scrollPos-' + window.location.pathname, window.scrollY.toString());
});

// 恢复滚动位置
if (sessionStorage.getItem('scrollPos-' + window.location.pathname)) {
  window.scrollTo(0, parseInt(sessionStorage.getItem('scrollPos-' + window.location.pathname) || '0'));
}
\`\`\`

- 添加以下CSS到styles.css，实现页面过渡效果:

\`\`\`css
/* 页面过渡动画 */
body {
  opacity: 1;
  transition: opacity 300ms ease-in-out;
}

body.page-exit {
  opacity: 0;
}

body.page-enter {
  animation: fadeIn 300ms ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
\`\`\`

## 主页要求
- 创建一个美观的主页，包含网站标题、丰富的内容和导航菜单
- 导航菜单应包含所有计划的HTML文件的链接
- 添加简短的内容概览
- 在页面底部添加作者信息区域
- 确保所有页面链接使用相对路径（如"chapter1.html"）

## 内容增强
- 识别关键概念，为其添加简短解释或定义
- 将长列表转换为分类展示或卡片式布局
- 为数据部分创建简单的可视化图表
- 为复杂概念添加简化说明或图示
- 使用emoji和图标突出重点内容
- 使用引用块、提示框等元素增强内容结构

## 响应式设计
- 页面必须在所有设备上（手机、平板、桌面）完美展示
- 针对不同屏幕尺寸优化布局和字体大小
- 确保移动端有良好的触控体验

## 输出要求
- 提供完整的index.html文件代码，以及单独的styles.css和scripts.js文件
- 确保代码符合W3C标准，无错误警告
- 在HTML头部引用外部CSS和JavaScript文件

以下是原始文本内容（仅供参考，主页应包含尽可能多的核心内容）：

${text.substring(0, 1500)}...

请根据上述规划和要求，创建网站的主页(index.html)以及共享的styles.css和scripts.js文件。请直接返回完整的HTML、CSS和JavaScript代码，不要包含任何其他解释或说明。`;

// 步骤3：生成内容页面提示词
const generateContentPagePrompt = (text: string, plan: WebsitePlan, fileIndex: number, previousFiles: Array<{name: string, content: string}>) => {
  const fileInfo = plan.files[fileIndex];
  const previousFilesInfo = previousFiles.length > 0 
    ? `\n\n## 已生成的文件\n${previousFiles.map(f => `- ${f.name}`).join('\n')}`
    : '';
  
  return `我会给你一个文本、网站规划和已生成的文件信息，请根据规划生成特定的内容页面：

## 网站规划
${JSON.stringify(plan, null, 2)}

## 当前需要生成的文件
${JSON.stringify(fileInfo, null, 2)}${previousFilesInfo}

## 重要设计要求
- 所有内容页面必须使用与index.html相同的样式和设计风格
- 内容应该丰富、精美，包含大量可视化元素
- 内容页应该能够与主页进行良好的内容交互
- 使用传统的HTML链接实现页面间导航，确保SEO友好性
- 所有页面必须引用相同的外部CSS和JavaScript文件（styles.css和scripts.js）

## 设计风格与视觉元素
- 整体风格参考Linear App的简约现代设计
- 使用清晰的视觉层次结构，突出重要内容
- 配色方案应专业、和谐，适合长时间阅读
- 与主页保持一致的设计语言和布局结构
- 大量使用适合内容的emoji、图标和视觉元素，提升页面设计感
- 为每个关键部分添加相关图标或可视化元素
- 使用Font Awesome图标库（通过CDN引入）丰富视觉表现
- 添加卡片设计、渐变色、阴影等现代设计元素
- 使用微动画和悬停效果增强交互体验

## 技术规范
- 使用HTML5、TailwindCSS 3.0+（通过CDN引入）和必要的JavaScript
- 实现完整的深色/浅色模式切换功能，默认跟随系统设置
- 确保与主页使用相同的外部CSS和JavaScript文件
- 使用传统的<a href="页面名.html">链接方式实现页面导航
- 确保页面具有以下元素:
  * 顶部导航栏，包含返回主页和访问其他页面的链接
  * 页面底部的"上一页"和"下一页"链接（如适用）
  * 与主页相同的深色/浅色模式切换按钮

## 内容页面要求
- 创建一个美观的内容页面，包含页面标题和内容
- 添加导航栏，包含返回主页和访问其他页面的链接
- 使用标准HTML链接，例如: <a href="index.html">返回主页</a>
- 在页面底部添加"返回主页"和可能的"上一页"/"下一页"按钮（如适用）
- 在页面底部添加与主页相同的作者信息区域

## 内容增强
- 识别关键概念，为其添加简短解释或定义
- 将长列表转换为分类展示或卡片式布局
- 为数据部分创建简单的可视化图表
- 为复杂概念添加简化说明或图示
- 使用emoji和图标突出重点内容
- 使用引用块、提示框等元素增强内容结构

## 响应式设计
- 页面必须在所有设备上（手机、平板、桌面）完美展示
- 针对不同屏幕尺寸优化布局和字体大小
- 确保移动端有良好的触控体验

## 输出要求
- 提供完整的${fileInfo.filename}文件代码
- 确保代码符合W3C标准，无错误警告
- 确保与已生成的文件风格一致
- 在HTML头部引用与主页相同的外部CSS和JavaScript文件

以下是原始文本内容（请根据当前文件的规划选择相关内容）：

${text}

请根据上述规划和要求，创建${fileInfo.filename}页面。请直接返回完整的HTML代码，不要包含任何其他解释或说明。`;
};

// 调用Monica AI API
async function callMonicaAPI(promptText: string) {
  try {
    // 获取并清理API密钥，去除可能的换行符和空格
    const apiKey = process.env.MONICA_API_KEY || '';
    const cleanedApiKey = apiKey.replace(/[\r\n\s]+/g, '');
    
    if (!cleanedApiKey) {
      console.error('Monica API密钥未设置或无效');
      throw new Error('AI服务配置错误');
    }
    
    console.log('准备调用Monica AI API，提示词长度:', promptText.length);
    
    const response = await fetchWithTimeout(
      'https://openapi.monica.im/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanedApiKey}`
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
          temperature: 0.7,
          max_tokens: 4000
        })
      },
      TIMEOUT_MS
    );

    if (!response.ok) {
      // 增强错误处理，提供更清晰的状态码和错误信息
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Monica AI API错误 (${response.status}): ${errorText}`);
      
      if (response.status === 401 || response.status === 403) {
        throw new Error('API密钥无效或未授权');
      } else if (response.status === 429) {
        throw new Error('API请求过多，已超出配额限制');
      } else if (response.status >= 500) {
        throw new Error('Monica AI服务器错误，请稍后再试');
      } else {
        throw new Error(`调用AI服务失败 (HTTP ${response.status})`);
      }
    }

    const data = await response.json();
    // 检查响应格式是否正确
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('Monica AI响应格式错误:', JSON.stringify(data));
      throw new Error('AI服务返回了无效的响应格式');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('调用Monica AI API时出错:', error);
    
    // 根据错误类型提供更友好的错误信息
    if (error instanceof Error) {
      // 检查是否为网络错误
      if (error.message.includes('fetch failed') || 
          error.message.includes('socket') || 
          error.message.includes('network') ||
          error.message.includes('connection')) {
        console.error('详细错误信息:', error.message, error.cause);
        throw new Error('无法连接到Monica AI服务器，请检查网络连接后重试');
      } else if (error.message.includes('aborted') || error.message.includes('timeout')) {
        throw new Error('请求超时，服务器响应时间过长，请稍后重试');
      }
      
      // 重新抛出已经格式化的错误
      throw error;
    }
    
    throw new Error('调用AI服务时发生未知错误');
  }
}

// 解析JSON，处理可能的格式问题
function safeParseJSON(text: string) {
  try {
    // 尝试找到JSON部分
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                      text.match(/\{[\s\S]*\}/);
    
    const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('解析JSON失败:', error);
    console.error('原始文本:', text);
    throw new Error('无法解析规划数据');
  }
}

export async function POST(request: Request) {
  try {
    // 解析请求
    const reqData = await request.json();
    const { text, step, plan, fileIndex, generatedFiles } = reqData;
    
    if (!text || text.trim() === '') {
      return NextResponse.json(
        { error: '请提供文本内容' },
        { status: 400 }
      );
    }

    // 验证必需参数
    if (!step) {
      return NextResponse.json(
        { error: '缺少必需参数: step' },
        { status: 400 }
      );
    }
    
    // 对每个步骤验证额外必需的参数
    if (step === 'index' && !plan) {
      return NextResponse.json(
        { error: '生成主页时需要提供网站规划(plan)参数' },
        { status: 400 }
      );
    }
    
    if (step === 'content') {
      if (!plan) {
        return NextResponse.json(
          { error: '生成内容页时需要提供网站规划(plan)参数' },
          { status: 400 }
        );
      }
      
      if (fileIndex === undefined) {
        return NextResponse.json(
          { error: '生成内容页时需要提供文件索引(fileIndex)参数' },
          { status: 400 }
        );
      }
      
      if (!generatedFiles) {
        return NextResponse.json(
          { error: '生成内容页时需要提供已生成的文件列表(generatedFiles)参数' },
          { status: 400 }
        );
      }
    }
    
    // 文本长度检查 - 当文本过长时提供警告
    if (text.length > 30000) {
      console.warn(`警告: 文本内容非常长(${text.length}字符)，可能导致处理超时`);
    }
    
    console.log(`执行分步生成 - 步骤: ${step}, 文本长度: ${text.length}`);

    try {
      // 根据步骤执行不同的操作
      if (step === 'planning') {
        // 步骤1：内容分析和规划
        console.log('执行步骤1：内容分析和规划');
        const promptText = planningPrompt(text);
        const content = await callMonicaAPI(promptText);
        console.log('规划完成，内容长度:', content.length);
        
        // 解析规划数据
        const planData = safeParseJSON(content);
        
        // 添加更详细的日志输出，展示规划的具体内容
        console.log('规划数据:', JSON.stringify(planData, null, 2));
        
        return NextResponse.json({ 
          step: 'planning',
          plan: planData,
          // 添加原始内容和时间戳，保持与前端期望的数据结构一致
          preview: JSON.stringify(planData, null, 2),
          timestamp: new Date().toISOString()
        });
        
      } else if (step === 'index') {
        // 步骤2：生成主页
        if (!plan) {
          return NextResponse.json(
            { error: '缺少网站规划数据' },
            { status: 400 }
          );
        }
        
        console.log('执行步骤2：生成主页');
        const promptText = generateIndexPrompt(text, plan);
        const content = await callMonicaAPI(promptText);
        console.log('主页生成完成，内容长度:', content.length);
        
        // 提取HTML、CSS和JavaScript内容
        const extractedFiles = extractMultipleFiles(content);
        
        // 准备文件列表
        let files = [];
        
        // 如果成功提取了多个文件
        if (extractedFiles.length > 0) {
          files = extractedFiles;
        } else {
          // 如果只提取到HTML，则创建默认的CSS和JS文件
          const htmlContent = extractHtmlContent(content);
          files = [
            {
              name: 'index.html',
              content: htmlContent
            },
            {
              name: 'styles.css',
              content: '/* 默认样式 */\n/* 页面过渡动画 */\nbody {\n  opacity: 1;\n  transition: opacity 300ms ease-in-out;\n}\n\nbody.page-exit {\n  opacity: 0;\n}\n\nbody.page-enter {\n  animation: fadeIn 300ms ease-in-out;\n}\n\n@keyframes fadeIn {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}'
            },
            {
              name: 'scripts.js',
              content: '// 页面加载完成后执行\ndocument.addEventListener(\'DOMContentLoaded\', function() {\n  // 获取所有页面链接\n  const pageLinks = document.querySelectorAll(\'a[href$=".html"]\');\n  \n  // 为每个链接添加点击事件\n  pageLinks.forEach(link => {\n    link.addEventListener(\'click\', function(e) {\n      // 仅处理同域名下的链接\n      if (this.hostname === window.location.hostname) {\n        e.preventDefault();\n        const targetPage = this.getAttribute(\'href\');\n        \n        // 添加页面退出动画\n        document.body.classList.add(\'page-exit\');\n        \n        // 动画结束后加载新页面\n        setTimeout(function() {\n          window.location.href = targetPage;\n        }, 300); // 300ms与CSS过渡时间匹配\n      }\n    });\n  });\n  \n  // 页面加载时添加进入动画\n  document.body.classList.add(\'page-enter\');\n});\n\n// 保存当前页面滚动位置到sessionStorage\nwindow.addEventListener(\'beforeunload\', function() {\n  sessionStorage.setItem(\'scrollPos-\' + window.location.pathname, window.scrollY.toString());\n});\n\n// 恢复滚动位置\nif (sessionStorage.getItem(\'scrollPos-\' + window.location.pathname)) {\n  window.scrollTo(0, parseInt(sessionStorage.getItem(\'scrollPos-\' + window.location.pathname) || \'0\'));\n}\n\`\`\`'
            }
          ];
        }
        
        // 确定下一步
        const nextStep = plan.files.length > 1 ? 'content' : 'complete';
        const nextFileIndex = 1; // 从第二个文件开始（如果有的话）
        
        return NextResponse.json({
          step: 'index', 
          files,
          nextStep,
          fileIndex: nextFileIndex
        });
        
      } else if (step === 'content') {
        // 步骤3：生成内容页面
        if (!plan || fileIndex === undefined || !generatedFiles) {
          return NextResponse.json(
            { error: '缺少必要参数' },
            { status: 400 }
          );
        }
        
        if (fileIndex >= plan.files.length) {
          return NextResponse.json(
            { error: '文件索引超出范围' },
            { status: 400 }
          );
        }
        
        const fileInfo = plan.files[fileIndex];
        console.log(`执行步骤3：生成内容页面 ${fileIndex} - ${fileInfo.filename}`);
        
        const promptText = generateContentPagePrompt(text, plan, fileIndex, generatedFiles);
        const content = await callMonicaAPI(promptText);
        console.log(`页面 ${fileIndex} 生成完成，内容长度:`, content.length);
        
        // 提取HTML内容
        const htmlContent = extractHtmlContent(content);
        
        // 更新文件列表
        const updatedFiles = [...generatedFiles];
        
        // 检查是否已经有styles.css和scripts.js文件
        const hasStylesFile = updatedFiles.some(file => file.name === 'styles.css');
        const hasScriptsFile = updatedFiles.some(file => file.name === 'scripts.js');
        
        // 尝试从内容中提取CSS和JS
        const extractedFiles = extractMultipleFiles(content);
        const cssFile = extractedFiles.find(file => file.name === 'styles.css');
        const jsFile = extractedFiles.find(file => file.name === 'scripts.js');
        
        // 如果没有styles.css文件，但从内容中提取到了，则添加
        if (!hasStylesFile && cssFile) {
          updatedFiles.push(cssFile);
        }
        
        // 如果没有scripts.js文件，但从内容中提取到了，则添加
        if (!hasScriptsFile && jsFile) {
          updatedFiles.push(jsFile);
        }
        
        // 添加当前生成的HTML文件
        updatedFiles.push({
          name: fileInfo.filename,
          content: htmlContent
        });
        
        // 确定下一步
        const nextFileIndex = fileIndex + 1;
        const nextStep = nextFileIndex < plan.files.length ? 'content' : 'complete';
        
        return NextResponse.json({
          step: 'content',
          files: updatedFiles,
          nextStep,
          fileIndex: nextFileIndex
        });
        
      } else {
        return NextResponse.json(
          { error: '无效的生成步骤' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('生成过程中出错:', error);
      
      // 根据错误类型返回适当的错误信息
      let status = 500;
      let errorMessage = '生成过程中出错';
      let additionalInfo = {};
      
      if (error instanceof Error) {
        console.error('详细错误信息:', error.message, error.cause || '无更多详情');
        errorMessage = error.message;
        
        // 处理不同类型的错误
        if (error.message.includes('API请求超时') || error.message.includes('timeout') || error.message.includes('timed out')) {
          status = 504; // 网关超时
          
          // 根据当前步骤提供更具体的建议
          let suggestion = '请减少文本量或稍后再试';
          if (step === 'planning') {
            suggestion = `文本较长(${text?.length || '未知'}字符)可能导致规划超时，请减少文本量后重试`;
          } else if (step === 'index') {
            suggestion = '主页生成超时，可能是网站结构过于复杂，建议简化规划';
          } else if (step === 'content') {
            suggestion = '内容页面生成超时，可能是页面内容过于复杂，建议分割内容';
          }
          
          errorMessage = `生成超时，${suggestion}`;
          additionalInfo = { step, suggestion, textLength: text?.length };
        } else if (error.message.includes('API密钥无效') || error.message.includes('未授权')) {
          status = 401;
          additionalInfo = { auth: 'failed' };
        } else if (error.message.includes('fetch failed') || error.message.includes('socket') || error.message.includes('connection') || error.message.includes('网络连接')) {
          status = 503; // 服务不可用
          errorMessage = '网络连接错误，无法连接到AI服务器，请检查网络后重试';
          additionalInfo = { 
            network: 'failed',
            errorDetails: error.message,
            retry: '请尝试重新生成，如果问题持续存在，请联系管理员'
          };
        } else if (error.message.includes('调用AI服务失败') || error.message.includes('failed') || error.message.includes('aborted')) {
          status = 502; // 坏网关
          errorMessage = '连接AI服务失败，请稍后再试';
          additionalInfo = { network: 'failed' };
        } else if (error.message.includes('API调用频率超限') || error.message.includes('配额限制')) {
          status = 429; // 请求过多
          errorMessage = 'API调用频率超限，请稍后再试';
          additionalInfo = { rateLimit: 'exceeded' };
        } else if (error.message.includes('AI服务器暂时响应异常') || error.message.includes('服务器错误')) {
          status = 503; // 服务不可用
          errorMessage = 'AI服务暂时不可用，请稍后再试';
          additionalInfo = { server: 'unavailable' };
        } else if (error.message.includes('无法解析')) {
          status = 422; // 无法处理的实体
          errorMessage = '无法解析AI返回的数据，请重试';
          additionalInfo = { parsing: 'failed', step };
        }
      }
      
      // 记录最终返回的错误信息
      console.error(`返回错误 (${status}): ${errorMessage}`, additionalInfo);
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: additionalInfo,
          step
        },
        { status }
      );
    }
  } catch (error) {
    console.error('处理请求时出错:', error);
    
    let errorMessage = '服务器内部错误';
    let status = 500;
    
    if (error instanceof Error) {
      console.error('错误堆栈:', error.stack);
      
      // 检测是否是JSON解析错误
      if (error.message.includes('JSON')) {
        errorMessage = '请求格式错误，无法解析JSON数据';
        status = 400;
      } else {
        errorMessage = `服务器错误: ${error.message}`;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}

// 提取HTML内容
function extractHtmlContent(content: string): string {
  // 如果内容已经是HTML格式，直接返回
  if (content.trim().startsWith('<!DOCTYPE html>') || content.trim().startsWith('<html')) {
    return content;
  }
  
  // 尝试从代码块中提取HTML
  const htmlMatch = content.match(/```html\s*([\s\S]*?)\s*```/) || 
                    content.match(/```\s*(<!DOCTYPE html>[\s\S]*?)\s*```/);
  
  if (htmlMatch && htmlMatch[1]) {
    return htmlMatch[1].trim();
  }
  
  // 尝试查找HTML标记
  const doctypeIndex = content.indexOf('<!DOCTYPE html>');
  const htmlStartIndex = content.indexOf('<html');
  const htmlEndIndex = content.lastIndexOf('</html>') + '</html>'.length;
  
  if ((doctypeIndex !== -1 || htmlStartIndex !== -1) && htmlEndIndex !== -1) {
    const startIndex = doctypeIndex !== -1 ? doctypeIndex : htmlStartIndex;
    return content.substring(startIndex, htmlEndIndex).trim();
  }
  
  // 如果无法提取，返回原始内容
  console.warn('无法提取HTML内容，返回原始内容');
  return content;
}

// 提取多个文件（HTML、CSS、JS）
function extractMultipleFiles(content: string): Array<{name: string, content: string}> {
  const files: Array<{name: string, content: string}> = [];
  
  // 尝试提取HTML文件
  const htmlContent = extractHtmlContent(content);
  if (htmlContent) {
    files.push({
      name: 'index.html',
      content: htmlContent
    });
  }
  
  // 尝试提取CSS文件
  const cssMatch = content.match(/```css\s*([\s\S]*?)\s*```/) || 
                   content.match(/styles\.css\s*```\s*([\s\S]*?)\s*```/);
  
  if (cssMatch && cssMatch[1]) {
    files.push({
      name: 'styles.css',
      content: cssMatch[1].trim()
    });
  }
  
  // 尝试提取JavaScript文件
  const jsMatch = content.match(/```javascript\s*([\s\S]*?)\s*```/) || 
                  content.match(/```js\s*([\s\S]*?)\s*```/) ||
                  content.match(/scripts\.js\s*```\s*([\s\S]*?)\s*```/);
  
  if (jsMatch && jsMatch[1]) {
    files.push({
      name: 'scripts.js',
      content: jsMatch[1].trim()
    });
  }
  
  // 尝试查找其他HTML文件
  const otherHtmlFiles = content.match(/```html\s*(.+?\.html)\s*([\s\S]*?)\s*```/g);
  if (otherHtmlFiles) {
    for (const fileMatch of otherHtmlFiles) {
      const nameMatch = fileMatch.match(/```html\s*(.+?\.html)/);
      if (nameMatch && nameMatch[1] && nameMatch[1] !== 'index.html') {
        const contentMatch = fileMatch.match(/```html\s*.+?\.html\s*([\s\S]*?)\s*```/);
        if (contentMatch && contentMatch[1]) {
          files.push({
            name: nameMatch[1],
            content: contentMatch[1].trim()
          });
        }
      }
    }
  }
  
  return files;
} 