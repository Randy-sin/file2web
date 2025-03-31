'use client';

/**
 * TextEditor组件
 * 
 * 该组件允许用户输入文本内容，并将其转换为精美的可视化网页。
 * 支持标准模式：生成单一HTML文件
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
import { FileUp, Wand2, AlertTriangle, Zap, Globe, Bot } from 'lucide-react';
import HtmlPreview from './HtmlPreview';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInterface, { GenerationStatus } from './ChatInterface';
import SplitView from './SplitView';
import { ContentType, DesignStylePreset } from '@/lib/prompts';
import ContentOptions from './ContentOptions';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

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
function createTimeoutSignal(timeoutMs = 1800000) { // 30分钟超时
  return AbortSignal.timeout(timeoutMs);
}

export default function TextEditor() {
  const [text, setText] = useState('');
  const [autoPublish, setAutoPublish] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<Array<{name: string, content: string}> | null>(null);
  const [isMultiFile, setIsMultiFile] = useState<boolean>(false);
  const [useClaudeModel, setUseClaudeModel] = useState<boolean>(true);

  // 分步生成相关状态
  const [generationStep, setGenerationStep] = useState<string>('planning');
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationTotal, setGenerationTotal] = useState<number>(0);
  const [generationMessage, setGenerationMessage] = useState<string>('');
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 添加新的状态变量
  const [contentType, setContentType] = useState<ContentType | undefined>(undefined);
  const [designStyle, setDesignStyle] = useState<DesignStylePreset | undefined>(undefined);
  const [isDetectingContent, setIsDetectingContent] = useState(false);

  // 添加startTimeRef用于在渲染之间保持开始时间
  const startTimeRef = useRef<number | null>(null);

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

  // 重置计时器
  const resetTimer = () => {
    startTimeRef.current = null;
    setElapsedTime(0);
  };

  // 重置所有状态
  const resetState = () => {
    resetTimer();
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
    setGenerationStatus('idle');
    setApiResponses([]); // 重置API响应
  };

  // 自动检测文本内容类型
  const detectContentType = async () => {
    if (!text || text.trim().length < 50) return;
    
    setIsDetectingContent(true);
    try {
      const response = await fetch('/api/detect-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('检测内容类型失败:', errorData.error);
        return;
      }
      
      const data = await response.json();
      console.log('检测到的内容类型:', data.contentType);
      console.log('推荐的设计风格:', data.designStyle);
      
      if (data.contentType) {
        setContentType(data.contentType);
      }
      
      if (data.designStyle) {
        setDesignStyle(data.designStyle);
      }
    } catch (error) {
      console.error('检测内容类型时出错:', error);
    } finally {
      setIsDetectingContent(false);
    }
  };

  // 处理规划步骤
  const handlePlanningStep = async (stepResponse: any) => {
    // 通用处理，不再区分高精度模式
    setGenerationMessage('网站规划已完成，正在生成主页...');
    const planningData = stepResponse.plan;
    
    console.log('规划数据:', JSON.stringify(planningData, null, 2));
    
    // 直接使用setApiResponses而不是未定义的addApiResponse
    setApiResponses(prev => [...prev, {
      step: 'planning',
      data: planningData,
      timestamp: new Date().toISOString()
    }]);
    
    return planningData;
  };

  // 处理主页生成错误
  const handleIndexError = (indexResponse: Response, errorMessage: string) => {
    // 不再区分高精度模式，统一错误处理
    if (indexResponse.status === 504 || errorMessage.includes('504')) {
      errorMessage = '生成请求超时，请稍后再试或减少文本量';
    }
    throw new Error(errorMessage);
  };
  
  // 处理内容页生成错误
  const handleContentError = (contentResponse: Response, errorMessage: string) => {
    // 不再区分高精度模式，统一错误处理
    if (contentResponse.status === 504 || errorMessage.includes('504')) {
      errorMessage = '生成请求超时，请稍后再试或减少文本量';
    }
    throw new Error(errorMessage);
  };

  // 处理分步生成错误
  const handleStepGenerationError = (error: Error, textLength: number) => {
    let errorMessage = '生成网页时出错，请重试';
    
    if (error.message.includes('504')) {
      errorMessage = '生成请求超时，请稍后再试或减少文本量';
    }
    else if (error.message.includes('signal timed out')) {
      if (textLength > 10000) {
        errorMessage = `文本内容过长(${textLength}字符)导致生成超时，请减少文本量至少50%(建议5000字以内)后重试。`;
      } else if (textLength > 5000) {
        errorMessage = `文本内容较长(${textLength}字符)可能导致处理超时，请尝试减少文本量后重试。`;
      } else {
        errorMessage = '生成请求超时，可能是因为服务负载较高，请稍后再试。';
      }
    } else if (error.message.includes('fetch failed')) {
      errorMessage = '连接到AI服务失败，请检查您的网络连接并重试。如果问题持续存在，可能是服务临时不可用。';
    } else if (error.message.includes('timeout') || error.message.includes('超时')) {
      errorMessage = '生成请求处理超时，请尝试减少文本量后重试。';
    } else {
      errorMessage = error.message;
    }
    
    return errorMessage;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('请输入文字内容');
      return;
    }

    // 重置所有状态
    resetState();
    setIsLoading(true);
    
    // 切换到聊天界面
    setShowChatInterface(true);
    
    try {
      // 更新生成状态
      setGenerationStatus('generating');
      
      console.log('发送请求到API...', useClaudeModel ? '使用Claude模型' : '使用DeepSeek模型');
      const response = await fetchWithRetry('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          contentType,
          designStyle,
          useClaudeModel  // 添加模型选择参数
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
        
        // 统一错误处理
        if (error.message.includes('504')) {
          errorMessage = '生成请求超时，请稍后再试或减少文本量';
        }
        else if (error.message.includes('signal timed out')) {
          // 文本过长导致的超时情况
          const textLength = text.length;
          if (textLength > 10000) {
            errorMessage = `文本内容过长(${textLength}字符)导致生成超时，请减少文本量至少50%(建议5000字以内)后重试。`;
          } else if (textLength > 5000) {
            errorMessage = `文本内容较长(${textLength}字符)可能导致处理超时，请尝试减少文本量后重试。`;
          } else {
            errorMessage = '生成请求超时，可能是因为服务负载较高，请稍后再试。';
          }
        } else if (error.message.includes('fetch failed')) {
          errorMessage = '连接到AI服务失败，请检查您的网络连接并重试。如果问题持续存在，可能是服务临时不可用。';
        } else if (error.message.includes('timeout') || error.message.includes('超时')) {
          // 超时但不是因为signal timed out
          errorMessage = '生成请求处理超时，请尝试减少文本量后重试。';
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
      }, 100);
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

  // 添加计时器effect - 在现有useEffect前添加
  useEffect(() => {
    // 只有当生成状态为generating时才创建计时器
    if (generationStatus !== 'generating') {
      // 如果不是generating状态，确保重置计时器
      if (startTimeRef.current !== null) {
        resetTimer();
      }
      return;
    }
    
    // 开始计时 - 只在首次进入generating状态时设置开始时间
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }
    
    console.log('创建计时器');
    // 创建计时器
    const interval = setInterval(() => {
      if (startTimeRef.current === null) return;
      const currentTime = Date.now();
      const elapsed = Math.floor((currentTime - startTimeRef.current) / 1000);
      setElapsedTime(elapsed);
    }, 1000);
    
    // 返回清理函数
    return () => {
      console.log('清理计时器');
      clearInterval(interval);
    };
  }, [generationStatus]); // 依赖于generationStatus而不是startTimeRef.current

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
              <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-600">
                <Bot className={`w-4 h-4 ${useClaudeModel ? 'text-purple-500' : 'text-gray-400'}`} />
                <div className="flex items-center">
                  <Label 
                    htmlFor="use-claude" 
                    className={`text-sm ${useClaudeModel ? 'font-medium text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'} cursor-pointer mr-2`}
                  >
                    调用Claude
                  </Label>
                  <Switch
                    id="use-claude"
                    checked={useClaudeModel}
                    onCheckedChange={setUseClaudeModel}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-blue-500"
                  />
                </div>
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
                          // 调用生成函数
                          const fakeEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
                          handleSubmit(fakeEvent);
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
                <div className="relative mt-2">
                  <textarea
                    id="text-input"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white min-h-[250px]"
                    placeholder="输入您想要可视化的文本内容..."
                    value={text}
                    onChange={handleTextChange}
                    disabled={isLoading}
                    ref={textareaRef}
                  ></textarea>
                  
                  {/* 添加内容类型和设计风格选择器 */}
                  {!isLoading && (
                    <ContentOptions 
                      contentType={contentType}
                      designStyle={designStyle}
                      onContentTypeChange={setContentType}
                      onDesignStyleChange={setDesignStyle}
                      onAutoDetect={detectContentType}
                      text={text}
                      isLoading={isLoading || isDetectingContent}
                    />
                  )}
                </div>
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
                    <li className="text-green-500 dark:text-green-400 font-medium">
                      生成完成后将自动发布网页并提供访问链接
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-4">
                        网页将自动发布到互联网，您可以直接与他人分享链接
                      </div>
                    </li>
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
                        'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          生成中...
                        </>
                      ) : (
                        <>
                          <Wand2 size={18} className="mr-2" />
                          生成网页
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