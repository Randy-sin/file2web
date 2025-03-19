'use client';

/**
 * TextEditor组件
 * 
 * 该组件允许用户输入文本内容，并将其转换为精美的可视化网页。
 * 支持两种生成模式：
 * 1. 标准模式：生成单一HTML文件
 * 2. 高精度模式：使用分步生成技术，将内容拆分为多个互联的HTML文件
 * 
 * 分步生成流程：
 * - 步骤1（planning）：分析内容并规划网站结构
 * - 步骤2（index）：生成网站主页
 * - 步骤3（content）：逐个生成内容页面
 * 
 * 分步生成的优势：
 * - 可以处理更长的文本内容，避免请求超时
 * - 保持上下文连贯性，确保生成结果质量
 * - 提供实时进度反馈，改善用户体验
 */

import { useState, useRef, useEffect } from 'react';
import { FileUp, Wand2, AlertTriangle, Zap, Globe } from 'lucide-react';
import HtmlPreview from './HtmlPreview';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInterface, { GenerationStatus } from './ChatInterface';
import SplitView from './SplitView';

// 自定义fetch函数，支持自动重试
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 2) {
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      if (retries > 0) {
        console.log(`尝试第 ${retries} 次重试...`);
        // 重试前等待时间递增
        await new Promise(resolve => setTimeout(resolve, retries * 1000));
      }
      
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (retries === maxRetries) {
        throw error;
      }
      
      console.error(`请求失败，将重试 (${retries + 1}/${maxRetries}):`, error);
      retries++;
    }
  }
  
  // 这行代码不应该执行到，但为了类型安全
  throw new Error('所有重试都失败了');
}

// 为每个请求创建一个更长的超时信号
function createTimeoutSignal(timeoutMs = 600000) { // 10分钟超时
  return AbortSignal.timeout(timeoutMs);
}

export default function TextEditor() {
  const [text, setText] = useState('');
  const [autoPublish, setAutoPublish] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [isHighPerformance, setIsHighPerformance] = useState<boolean>(false);
  const [generatedFiles, setGeneratedFiles] = useState<Array<{name: string, content: string}> | null>(null);
  const [isMultiFile, setIsMultiFile] = useState<boolean>(false);

  // 分步生成相关状态
  const [generationStep, setGenerationStep] = useState<string>('planning');
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationTotal, setGenerationTotal] = useState<number>(0);
  const [generationMessage, setGenerationMessage] = useState<string>('');
  const [isStepGeneration, setIsStepGeneration] = useState<boolean>(false);
  const [retryAvailable, setRetryAvailable] = useState<boolean>(false);
  
  // 添加API响应内容的状态
  const [apiResponses, setApiResponses] = useState<Array<{
    step: string;
    data: Record<string, unknown>;
    preview?: string;
    timestamp: string;
    htmlPreview?: string;
    files?: string[];
  }>>([]);
  
  // 聊天界面相关状态
  const [showChatInterface, setShowChatInterface] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
  
  // 引用
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
    };
    reader.readAsText(file);
  };

  // 开始计时器
  const startTimer = () => {
    // 确保先停止之前的计时器
    stopTimer();
    
    const startTime = Date.now();
    setElapsedTime(0);
    
    // 每秒更新已用时间
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const elapsed = Math.floor((currentTime - startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);
    
    setTimerInterval(interval);
  };

  // 停止计时器
  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  // 重置所有状态
  const resetState = () => {
    stopTimer();
    setElapsedTime(0);
    setError(null);
    setDebugInfo(null);
    setGeneratedHtml(null);
    setGeneratedFiles(null);
    setIsMultiFile(false);
    setRetryAvailable(false);
    
    // 重置分步生成状态
    setGenerationStep('planning');
    setGenerationProgress(0);
    setGenerationTotal(0);
    setGenerationMessage('');
    setIsStepGeneration(false);
    setGenerationStatus('idle');
    setApiResponses([]); // 重置API响应
  };

  // 执行分步生成过程
  const executeStepGeneration = async () => {
    if (!text.trim()) {
      setError('请输入文字内容');
      return;
    }
    
    // 重置所有状态
    resetState();
    setIsLoading(true);
    setIsStepGeneration(true);
    
    // 切换到聊天界面
    setShowChatInterface(true);
    
    // 开始计时
    startTimer();
    
    // 步骤1：内容分析和规划
    setGenerationStep('planning');
    setGenerationStatus('planning');
    setGenerationMessage('正在分析内容并规划网站结构...');
    try {
      console.log('执行分步生成 - 步骤: planning, 文本长度:', text.length);
      const planningResponse = await fetchWithRetry('/api/generate-step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          step: 'planning'
        }),
        signal: createTimeoutSignal()
      });
      
      if (!planningResponse.ok) {
        let errorMessage = '内容分析和规划失败';
        let errorDetails = null;
        
        try {
          const errorData = await planningResponse.json();
          errorMessage = errorData.error || errorMessage;
          errorDetails = errorData.details;
          
          // 记录详细的错误信息
          console.error('规划步骤API错误:', errorMessage, errorDetails);
        } catch (e) {
          console.error('解析错误响应失败:', e);
          // 尝试从状态文本获取更多信息
          errorMessage = `内容分析和规划失败 (HTTP ${planningResponse.status}): ${planningResponse.statusText}`;
        }
        
        // 如果包含网络相关错误，提供更具体的提示
        if (errorMessage.includes('网络连接') || errorMessage.includes('无法连接')) {
          errorMessage += '。请检查您的网络连接并尝试重新生成。';
        }
        
        throw new Error(errorMessage);
      }
      
      const planningData = await planningResponse.json();
      console.log('规划完成:', planningData);
      
      // 高精度模式特定处理：确保规划内容完整且可见
      if (isHighPerformance) {
        console.log('高精度模式规划数据:', JSON.stringify(planningData, null, 2));
        
        // 打印规划内容的关键信息，便于调试
        if (planningData.plan) {
          console.log(`网站规划概览 - 标题: ${planningData.plan.title}`);
          console.log(`总文件数: ${planningData.plan.files?.length || 0}`);
          console.log(`文件列表: ${planningData.plan.files?.map((f: any) => f.filename).join(', ')}`);
        }
        
        // 确保规划数据包含必要字段，增强数据结构稳定性
        if (!planningData.preview && planningData.plan) {
          planningData.preview = JSON.stringify(planningData.plan, null, 2);
        }
        
        if (!planningData.timestamp) {
          planningData.timestamp = new Date().toISOString();
        }
      }
      
      // 保存步骤1的API响应 - 优化保存的内容，提供更完整的数据
      setApiResponses(prev => [...prev, {
        step: 'planning',
        data: planningData.plan,
        preview: planningData.preview || JSON.stringify(planningData.plan, null, 2),
        timestamp: planningData.timestamp || new Date().toISOString()
      }]);
      
      // 确保在控制台输出完整的apiResponses，以便调试
      setTimeout(() => {
        console.log('API响应数组:', apiResponses);
      }, 100);
      
      // 更新规划和进度
      setGenerationTotal(planningData.plan.files.length);
      setGenerationProgress(0);
      
      // 保持在规划阶段一段时间，让用户能够查看规划内容
      // 添加一个特殊状态标识，表示规划已完成但还未开始生成主页
      setGenerationStatus('planning');
      setGenerationMessage('内容分析和规划已完成，即将开始生成网页...');
      
      // 延迟5秒，给用户时间查看规划内容
      console.log('规划已完成，等待5秒再开始生成主页...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 步骤2：生成主页
      setGenerationStep('index');
      setGenerationStatus('generating');
      setGenerationMessage('正在生成网站主页...');
      
      const indexResponse = await fetchWithRetry('/api/generate-step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          step: 'index',
          plan: planningData.plan
        }),
        signal: createTimeoutSignal()
      });
      
      if (!indexResponse.ok) {
        let errorMessage = '生成主页失败';
        let errorDetails = null;
        
        try {
          const errorData = await indexResponse.json();
          errorMessage = errorData.error || errorMessage;
          errorDetails = errorData.details;
          
          // 记录详细的错误信息
          console.error('主页生成API错误:', errorMessage, errorDetails);
        } catch (e) {
          console.error('解析错误响应失败:', e);
          // 尝试从状态文本获取更多信息
          errorMessage = `生成主页失败 (HTTP ${indexResponse.status}): ${indexResponse.statusText}`;
        }
        
        // 如果包含网络相关错误，提供更具体的提示
        if (errorMessage.includes('网络连接') || errorMessage.includes('无法连接')) {
          errorMessage += '。请检查您的网络连接并尝试重新生成。';
        }
        
        throw new Error(errorMessage);
      }
      
      const indexData = await indexResponse.json();
      console.log('主页生成完成:', indexData);
      
      // 保存步骤2的API响应 - 优化保存的内容
      const indexHtmlFile = indexData.files.find((f: {name: string}) => f.name === 'index.html');
      setApiResponses(prev => [...prev, {
        step: 'index',
        data: indexData,
        preview: indexHtmlFile ? indexHtmlFile.content : undefined,
        timestamp: new Date().toISOString(),
        htmlPreview: indexHtmlFile ? indexHtmlFile.content : undefined,
        files: indexData.files.map((f: {name: string, content: string}) => f.name)
      }]);
      
      // 更新文件列表和进度
      const currentFiles = indexData.files;
      setGeneratedFiles(currentFiles);
      setGenerationProgress(1);
      
      // 如果有更多文件需要生成
      if (indexData.nextStep === 'content') {
        // 步骤3：逐个生成内容页面
        let fileIndex = indexData.fileIndex;
        let nextStep = indexData.nextStep;
        let updatedFiles = currentFiles;
        
        while (nextStep === 'content') {
          setGenerationStep('content');
          
          // 获取当前正在生成的文件信息用于消息展示
          const currentFileInfo = planningData.plan.files[fileIndex];
          setGenerationMessage(`正在生成页面 ${fileIndex}/${planningData.plan.files.length - 1}：${currentFileInfo.filename}`);
          
          const contentResponse = await fetchWithRetry('/api/generate-step', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              text,
              step: 'content',
              plan: planningData.plan,
              fileIndex,
              generatedFiles: updatedFiles
            }),
            signal: createTimeoutSignal()
          });
          
          if (!contentResponse.ok) {
            let errorMessage = `生成页面 ${fileIndex} 失败`;
            let errorDetails = null;
            
            try {
              const errorData = await contentResponse.json();
              errorMessage = errorData.error || errorMessage;
              errorDetails = errorData.details;
              
              // 记录详细的错误信息
              console.error(`页面 ${fileIndex} 生成API错误:`, errorMessage, errorDetails);
            } catch (e) {
              console.error('解析错误响应失败:', e);
              // 尝试从状态文本获取更多信息
              errorMessage = `生成页面 ${fileIndex} 失败 (HTTP ${contentResponse.status}): ${contentResponse.statusText}`;
            }
            
            // 如果包含网络相关错误，提供更具体的提示
            if (errorMessage.includes('网络连接') || errorMessage.includes('无法连接')) {
              errorMessage += '。请检查您的网络连接并尝试重新生成。';
            }
            
            throw new Error(errorMessage);
          }
          
          const contentData = await contentResponse.json();
          console.log(`页面 ${fileIndex} 生成完成:`, contentData);
          
          // 保存每个内容页面的API响应 - 优化保存的内容
          const currentFile = planningData.plan.files[fileIndex];
          const contentHtmlFile = contentData.files.find(
            (f: {name: string}) => f.name === currentFile.filename
          );
          
          // 计算生成进度百分比，用于前端展示
          const progressPercent = Math.round(((fileIndex + 1) / (planningData.plan.files.length - 1)) * 100);
          
          setApiResponses(prev => [...prev, {
            step: 'content',
            data: {
              fileIndex,
              filename: currentFile.filename,
              title: currentFile.title,
              description: currentFile.description,
              contentData,
              progress: {
                current: fileIndex + 1,
                total: planningData.plan.files.length - 1,
                percent: progressPercent
              }
            },
            preview: contentHtmlFile ? contentHtmlFile.content : undefined,
            timestamp: new Date().toISOString(),
            htmlPreview: contentHtmlFile ? contentHtmlFile.content : undefined
          }]);
          
          // 更新文件列表和进度
          updatedFiles = contentData.files;
          setGeneratedFiles(updatedFiles);
          setGenerationProgress(fileIndex + 1);
          
          // 准备下一个文件
          fileIndex = contentData.fileIndex;
          nextStep = contentData.nextStep;
        }
        
        // 所有页面生成完成
        setGenerationStep('complete');
        setGenerationStatus('complete');
        setGenerationMessage('所有页面生成完成！');
        
        // 使用最新的updatedFiles变量来设置最终结果
        if (updatedFiles && updatedFiles.length > 0) {
          setGeneratedHtml(updatedFiles[0].content);
          setIsMultiFile(updatedFiles.length > 1);
          
          // 添加一个最终结果的API响应对象，用于在ChatInterface中展示
          setApiResponses(prev => [...prev, {
            step: 'summary',
            data: {
              totalFiles: updatedFiles.length,
              fileNames: updatedFiles.map((f: {name: string}) => f.name),
              mainFile: updatedFiles[0].name,
              timeElapsed: elapsedTime
            },
            timestamp: new Date().toISOString()
          }]);
          
          // 滚动到预览区域
          setTimeout(() => {
            if (previewRef.current) {
              console.log('分步生成完成，滚动到预览区域');
              previewRef.current.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start' 
              });
            }
          }, 1000);
        }
      } else {
        // 只有主页，没有其他内容页面
        setGenerationStep('complete');
        setGenerationStatus('complete');
        setGenerationMessage('所有页面生成完成！');
        
        // 使用currentFiles设置结果
        if (currentFiles && currentFiles.length > 0) {
          setGeneratedHtml(currentFiles[0].content);
          setIsMultiFile(currentFiles.length > 1);
          
          // 添加一个最终结果的API响应对象，用于在ChatInterface中展示
          setApiResponses(prev => [...prev, {
            step: 'summary',
            data: {
              totalFiles: currentFiles.length,
              fileNames: currentFiles.map((f: {name: string}) => f.name),
              mainFile: currentFiles[0].name,
              timeElapsed: elapsedTime,
              isSinglePage: true
            },
            timestamp: new Date().toISOString()
          }]);
          
          // 滚动到预览区域
          setTimeout(() => {
            if (previewRef.current) {
              console.log('分步生成完成，滚动到预览区域');
              previewRef.current.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start' 
              });
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error('分步生成过程中出错:', error);
      
      // 构建更友好的错误消息
      let errorMessage = '生成网页时出错';
      if (error instanceof Error) {
        // 保存原始错误信息以便于调试
        console.error('原始错误信息:', error.message, error.cause || '无详细原因');
        
        // 针对不同错误类型提供更友好的提示
        if (error.message.includes('signal timed out')) {
          // 文本过长导致的超时情况
          const textLength = text.length;
          if (textLength > 10000) {
            errorMessage = `文本内容过长(${textLength}字符)导致生成超时，请减少文本量至少50%(建议5000字以内)后重试。或者切换到高精度模式，它能更好地处理长文本。`;
          } else if (textLength > 5000) {
            errorMessage = `文本内容较长(${textLength}字符)可能导致处理超时，请尝试减少文本量或切换到高精度模式后重试。`;
          } else {
            errorMessage = '生成请求超时，可能是因为服务负载较高，请稍后再试。建议尝试高精度模式，它采用分步生成，成功率更高。';
          }
        } else if (error.message.includes('fetch failed') || error.message.includes('socket') || error.message.includes('网络连接') || error.message.includes('无法连接')) {
          // 丰富网络错误信息
          errorMessage = '连接到AI服务失败，请检查您的网络连接并重试。';
          
          // 如果是在生成规划步骤时出现的网络错误，说明可能是服务器问题
          if (generationStep === 'planning') {
            errorMessage += '如果您的网络正常，可能是AI服务暂时不可用，请稍后再试。';
          } else if (generationStep === 'index') {
            errorMessage += '主页生成过程中断开连接，请稍后重试。';
          } else if (generationStep === 'content') {
            errorMessage += `内容页面生成过程(第${generationProgress+1}/${generationTotal}页)中断开连接，请稍后重试。`;
          }
        } else if (error.message.includes('timeout') || error.message.includes('超时')) {
          // 超时但不是因为signal timed out
          errorMessage = '生成请求处理超时，请尝试减少文本量或切换到高精度模式后重试。';
        } else if (error.message.includes('API密钥无效') || error.message.includes('未授权')) {
          errorMessage = 'AI服务授权失败，请联系管理员检查API配置。';
        } else if (error.message.includes('调用AI服务失败')) {
          errorMessage = '调用AI服务失败，请稍后再试。如果问题持续存在，可能需要检查服务状态。';
        } else if (error.message.includes('The operation was aborted') || error.message.includes('aborted')) {
          errorMessage = '操作被中止，可能是因为浏览器取消了请求或服务暂时不可用。请稍后再试。';
        } else if (error.message.includes('API服务器错误') || error.message.includes('服务器错误')) {
          errorMessage = 'AI服务器出现内部错误，请稍后再试。服务团队正在处理这个问题。';
        } else {
          // 使用原始错误信息
          errorMessage = error.message;
        }
        
        // 添加重试建议
        if (!errorMessage.includes('请稍后再试') && !errorMessage.includes('重试')) {
          errorMessage += '。您可以尝试重新生成，如果问题持续存在，请联系管理员。';
        }
      }
      
      setError(errorMessage);
      setGenerationStatus('error');
      
      // 在发生网络相关错误或超时时提供重试按钮
      if (errorMessage.includes('网络') || 
          errorMessage.includes('连接') ||
          errorMessage.includes('服务') || 
          errorMessage.includes('请稍后再试') ||
          errorMessage.includes('超时') ||
          errorMessage.includes('减少文本量')) {
        setRetryAvailable(true);
      }
    } finally {
      // 确保在处理完成后设置加载状态为false
      // 使用setTimeout延迟执行，避免界面卡顿
      setTimeout(() => {
        setIsLoading(false);
        stopTimer();
      }, 100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('请输入文字内容');
      return;
    }

    // 高精度模式下使用分步生成
    if (isHighPerformance) {
      return executeStepGeneration();
    }
    
    // 标准模式下使用原有的生成方式
    // 重置所有状态
    resetState();
    setIsLoading(true);
    
    // 切换到聊天界面
    setShowChatInterface(true);
    
    // 开始计时
    startTimer();
    
    try {
      // 更新生成状态
      setGenerationStatus('generating');
      
      console.log('发送请求到API...', '标准模式');
      const response = await fetchWithRetry('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          isHighPerformance
        }),
        signal: createTimeoutSignal() // 使用更长的超时时间
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '生成网页时出错');
      }

      const data = await response.json();
      console.log('接收到响应:', data.html ? '成功' : '失败');
      
      // 更新生成状态
      setGenerationStatus('complete');
      
      if (!data.html) {
        console.error('API响应中没有HTML内容');
        setDebugInfo('API响应中没有HTML内容。响应数据: ' + JSON.stringify(data));
        throw new Error('生成的HTML内容为空');
      }
      
      // 使用requestAnimationFrame和setTimeout优化UI更新
      requestAnimationFrame(() => {
        setTimeout(() => {
          setGeneratedHtml(data.html);
          console.log('HTML内容已设置，长度:', data.html.length);
          
          // 如果是多文件模式，设置文件列表
          if (data.isMultiFile && data.files) {
            setIsMultiFile(true);
            setGeneratedFiles(data.files);
            console.log('多文件模式，文件数量:', data.files.length);
          }
        }, 100);
      });
      
      // 使用延迟函数滚动到预览区域，避免性能问题
      const scrollToPreview = () => {
        if (previewRef.current) {
          console.log('分步生成完成，滚动到预览区域');
          previewRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start' 
          });
        }
      };
      
      // 延迟滚动
      setTimeout(scrollToPreview, 1000);
      
    } catch (error) {
      console.error('生成网页时出错:', error);
      
      // 构建更友好的错误消息
      let errorMessage = '生成网页时出错，请重试';
      
      if (error instanceof Error) {
        console.error('原始错误信息:', error.message);
        
        // 针对不同错误类型提供更友好的提示
        if (error.message.includes('signal timed out')) {
          // 文本过长导致的超时情况
          const textLength = text.length;
          if (textLength > 10000) {
            errorMessage = `文本内容过长(${textLength}字符)导致生成超时，请减少文本量至少50%(建议5000字以内)后重试。或者切换到高精度模式，它能更好地处理长文本。`;
          } else if (textLength > 5000) {
            errorMessage = `文本内容较长(${textLength}字符)可能导致处理超时，请尝试减少文本量或切换到高精度模式后重试。`;
          } else {
            errorMessage = '生成请求超时，可能是因为服务负载较高，请稍后再试。建议尝试高精度模式，它采用分步生成，成功率更高。';
          }
        } else if (error.message.includes('fetch failed')) {
          errorMessage = '连接到AI服务失败，请检查您的网络连接并重试。如果问题持续存在，可能是服务临时不可用。';
        } else if (error.message.includes('timeout') || error.message.includes('超时')) {
          // 超时但不是因为signal timed out
          errorMessage = '生成请求处理超时，请尝试减少文本量或切换到高精度模式后重试。';
        } else if (error.message.includes('aborted')) {
          errorMessage = '操作被中止，可能是因为浏览器取消了请求或服务暂时不可用。请稍后再试。';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setGenerationStatus('error');
      
      // 在发生网络相关错误或超时时提供重试按钮
      if (errorMessage.includes('网络') || 
          errorMessage.includes('服务暂时不可用') || 
          errorMessage.includes('请稍后再试') ||
          errorMessage.includes('超时') ||
          errorMessage.includes('减少文本量')) {
        setRetryAvailable(true);
      }
    } finally {
      // 确保在处理完成后设置加载状态为false
      // 使用setTimeout延迟执行，避免界面卡顿
      setTimeout(() => {
        setIsLoading(false);
        stopTimer();
      }, 100);
    }
  };

  // 切换高精度模式
  const toggleHighPerformance = () => {
    // 切换高精度模式状态
    setIsHighPerformance(!isHighPerformance);
    
    // 重置状态，确保清理之前的数据
    resetState();
    
    // 在切换模式时记录日志
    console.log(`已切换到${!isHighPerformance ? '高精度' : '标准'}模式`);
    
    // 如果之前有错误提示，在切换模式后清除
    if (error) {
      setError(null);
    }
  };
  
  // 重新生成
  const handleRegenerate = () => {
    // 使用淡出效果先隐藏聊天界面
    setGeneratedHtml(null);
    setError(null);
    setRetryAvailable(false);
    
    // 重置聊天界面状态
    setGenerationStatus('idle');
    
    // 使用短暂延迟后再关闭聊天界面，让动画有时间执行
    setTimeout(() => {
      setShowChatInterface(false);
    }, 300);
  };
  
  // 查看预览
  const handleViewPreview = () => {
    if (previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 添加自动滚动到预览区域的useEffect
  useEffect(() => {
    // 当生成状态变为complete且有生成的HTML时，滚动到预览区域
    if (generationStatus === 'complete' && generatedHtml) {
      // 使用更长的延时确保内容渲染完成
      setTimeout(() => {
        if (previewRef.current) {
          console.log('自动滚动到预览区域');
          previewRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start' 
          });
        }
      }, 1000); // 使用更长的延时
    }
  }, [generationStatus, generatedHtml]);

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {showChatInterface ? (
          <motion.div
            key="chat-interface"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col"
            style={{ height: '100vh' }}
          >
            <SplitView
              leftContent={
                <div ref={editorRef} className="w-full h-full flex flex-col bg-white dark:bg-gray-800">
                  {/* 标题区域 - 增加上下内边距和水平间距，避免与返回按钮重叠 */}
                  <div className="pt-6 pb-4 px-8 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">输入内容</h2>
                      {isHighPerformance && (
                        <div className="flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          <Zap size={16} className="mr-1 animate-pulse" />
                          高精度模式
                        </div>
                      )}
                    </div>
                  </div>
                  {/* 内容区域 */}
                  <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900 rounded-lg m-4 border border-gray-200 dark:border-gray-700">
                    <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 font-mono text-sm">
                      {text}
                    </pre>
                  </div>
                </div>
              }
              rightContent={
                <ChatInterface
                  userInput={text}
                  isGenerating={isLoading}
                  generationStatus={generationStatus}
                  generationProgress={generationProgress}
                  generationTotal={generationTotal}
                  generationMessage={generationMessage}
                  generatedHtml={generatedHtml}
                  error={error}
                  onRegenerate={handleRegenerate}
                  generatedFiles={generatedFiles}
                  isMultiFile={isMultiFile}
                  apiResponses={apiResponses}
                />
              }
              initialLeftWidth={30}
              minLeftWidth={20}
              maxLeftWidth={50}
              isGenerating={isLoading}
              showBlurOverlay={false}
            />
          </motion.div>
        ) : (
          <motion.div
            key="text-editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-4 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">文本编辑器</h2>
              
              {/* 高精度模式切换按钮 */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={toggleHighPerformance}
                  className={`flex items-center px-3 py-1 rounded-full text-sm transition-colors ${
                    isHighPerformance 
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Zap size={16} className={`mr-1 ${isHighPerformance ? 'animate-pulse' : ''}`} />
                  高精度模式
                  <span className={`ml-2 w-3 h-3 rounded-full ${isHighPerformance ? 'bg-white' : 'bg-gray-400 dark:bg-gray-500'}`}></span>
                </button>

                <button
                  type="button"
                  onClick={() => setAutoPublish(!autoPublish)}
                  className={`flex items-center px-3 py-1 rounded-full text-sm transition-colors ${
                    autoPublish 
                      ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Globe size={16} className={`mr-1 ${autoPublish ? 'animate-pulse' : ''}`} />
                  自动发布
                  <span className={`ml-2 w-3 h-3 rounded-full ${autoPublish ? 'bg-white' : 'bg-gray-400 dark:bg-gray-500'}`}></span>
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="text-red-500 mr-3 mt-0.5" size={20} />
                  <div>
                    <p className="text-red-800 dark:text-red-200 mb-2">
                      {error}
                    </p>
                    {retryAvailable && (
                      <button
                        onClick={() => {
                          setError(null);
                          setRetryAvailable(false);
                          // 调用相应的生成函数
                          if (isHighPerformance) {
                            executeStepGeneration();
                          } else {
                            // 创建一个合适的事件对象
                            const fakeEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
                            handleSubmit(fakeEvent);
                          }
                        }}
                        className="mt-2 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                      >
                        重试
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {debugInfo && (
              <div className="p-4 bg-yellow-100 dark:bg-yellow-900 border-b border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-200">
                <p>调试信息:</p>
                <pre className="text-xs overflow-auto">{debugInfo}</pre>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="p-4">
                <textarea
                  className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="在这里输入您的文字内容，AI将分析内容并转化为美观的中文可视化网页..."
                  value={text}
                  onChange={handleTextChange}
                  disabled={isLoading}
                ></textarea>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <p className="mb-2"><strong>提示：</strong>您可以输入任何文本内容，AI将自动分析并创建一个精美的网页，包含以下特点：</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>简约现代的设计风格</li>
                    <li>响应式布局，适配所有设备</li>
                    <li>深色/浅色模式切换功能</li>
                    <li>精美的交互效果和动画</li>
                    <li>优化的性能和加载速度</li>
                    {isHighPerformance && (
                      <li className="text-orange-500 dark:text-orange-400 font-medium">
                        高精度模式：内容将被智能拆分为多个HTML文件，提供更丰富的展示效果
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-4">
                          此模式使用分步生成技术，能够处理较长文本，避免请求超时问题
                        </div>
                      </li>
                    )}
                    {autoPublish && (
                      <li className="text-green-500 dark:text-green-400 font-medium">
                        自动发布：生成完成后将自动发布网页并提供访问链接
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-4">
                          网页将自动发布到互联网，您可以直接与他人分享链接
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <label className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors cursor-pointer">
                    <FileUp size={18} className="mr-2" />
                    上传文件
                    <input
                      type="file"
                      className="hidden"
                      accept=".txt,.md,.html"
                      onChange={handleFileUpload}
                      disabled={isLoading}
                    />
                  </label>
                  
                  <div className="flex items-center">
                    <button
                      type="submit"
                      className={`w-full sm:w-auto flex items-center justify-center px-6 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isHighPerformance 
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' 
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {isStepGeneration ? '分步生成中...' : '生成中...'}
                        </>
                      ) : (
                        <>
                          {isHighPerformance ? (
                            <>
                              <Zap size={18} className="mr-2" />
                              分步高精度生成
                            </>
                          ) : (
                            <>
                              <Wand2 size={18} className="mr-2" />
                              生成网页
                            </>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 预览区域 */}
      {generatedHtml && (
        <div ref={previewRef} id="preview-section" className="w-full max-w-4xl mx-auto">
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">预览生成的网页</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isMultiFile 
                ? `已生成多文件网站，共 ${generatedFiles?.length || 0} 个文件` 
                : '您可以预览、下载或在新窗口中打开生成的网页'}
            </p>
          </div>
          
          {/* 预览提示信息 - Apple风格设计 */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  <span className="font-medium">提示：</span> 使用<span className="font-medium">「打开完整网站」</span>按钮可以在新窗口中浏览所有页面，支持页面间导航和链接跳转。使用<span className="font-medium">「打开当前页面」</span>按钮只能查看当前选中的单个页面。
                </p>
              </div>
            </div>
          </div>
          
          <HtmlPreview 
            html={generatedHtml} 
            isMultiFile={isMultiFile} 
            files={generatedFiles} 
            autoPublish={autoPublish}
          />
        </div>
      )}
    </div>
  );
} 