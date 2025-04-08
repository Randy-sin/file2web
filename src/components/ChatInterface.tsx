'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check, ExternalLink, Loader2, Sparkles, RefreshCw, MessageSquare, ChevronDown, 
  Copy, FileText, ArrowLeft, ChevronRight, Code, Layout, Server, Eye } from 'lucide-react';
import HtmlPreview from './HtmlPreview';

// 添加自定义样式
const styles = {
  highlightPulse: `
    @keyframes highlightPulse {
      0% { background-color: rgba(16, 185, 129, 0.1); }
      50% { background-color: rgba(16, 185, 129, 0.2); }
      100% { background-color: rgba(16, 185, 129, 0.1); }
    }
    .highlight-pulse {
      animation: highlightPulse 1.5s ease-in-out infinite;
      border: 1px solid rgba(16, 185, 129, 0.5);
      border-radius: 0.5rem;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
    }
    .dark .highlight-pulse {
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
    }
  `
};

// 生成状态类型
export type GenerationStatus = 'idle' | 'planning' | 'generating' | 'complete' | 'error';

// 定义消息类型
type MessageType = 'user' | 'ai' | 'system' | 'code' | 'api-response';

// 定义API响应类型
interface ApiResponse {
  step: string;
  data: Record<string, unknown>;
  preview?: string;
  timestamp?: string;
  htmlPreview?: string;
  files?: string[];
}

// 定义消息对象
interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  // 用于打字机效果
  displayContent?: string;
  isComplete?: boolean;
  // 用于展示API返回的结构化内容
  apiResponse?: ApiResponse;
  // 连接到下一步的标识
  nextStep?: string;
  // 针对API响应超时或网络错误，提供重试选项
  retryAvailable?: boolean;
}

interface ChatInterfaceProps {
  userInput: string;
  isGenerating: boolean;
  generationStatus: GenerationStatus;
  generationProgress: number;
  generationTotal: number;
  generationMessage: string;
  generatedHtml: string | null;
  error: string | null;
  onRegenerate: () => void;
  generatedFiles?: Array<{name: string, content: string}> | null;
  isMultiFile?: boolean;
  apiResponses?: Array<ApiResponse>;
}

// API响应显示组件
function ApiResponseDisplay({ response, isExpanded = false, onToggle }: { 
  response: ApiResponse; 
  isExpanded?: boolean;
  onToggle?: () => void;
}) {
  // 根据步骤类型设置默认展开状态
  const defaultExpanded = response.step === 'planning' || response.step === 'summary';
  const [expanded, setExpanded] = useState(isExpanded || defaultExpanded);
  
  // 切换展开/折叠状态
  const toggleExpand = () => {
    setExpanded(!expanded);
    if (onToggle) onToggle();
  };
  
  // 渲染不同类型的响应内容
  const renderContent = () => {
    switch (response.step) {
      case 'planning':
        return renderPlanningContent(response.data);
      case 'index':
        return renderIndexContent(response.data);
      case 'content':
        return renderContentContent(response.data);
      case 'summary':
        return renderSummaryContent(response.data);
      default:
        return <pre className="text-xs overflow-auto max-h-60 bg-gray-100 dark:bg-gray-800 p-2 rounded">
          {JSON.stringify(response.data, null, 2)}
        </pre>;
    }
  };
  
  // 渲染规划步骤内容
  const renderPlanningContent = (plan: any) => {
    return (
      <div className="space-y-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
          <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">🌐 网站规划</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">{plan.title || '未命名网站'}</p>
          {plan.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{plan.description}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">📄 文件结构</h5>
          <ul className="space-y-2">
            {plan.files && plan.files.map((file: any, index: number) => (
              <li key={index} className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded mr-2">
                    {index === 0 ? <Layout className="w-4 h-4 text-blue-500" /> : <FileText className="w-4 h-4 text-gray-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{file.filename}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{file.title}</p>
                  </div>
                  {file.description && (
                    <button 
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="查看详情"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {expanded && file.description && (
                  <div className="mt-2 ml-10 p-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-750 rounded">
                    {file.description}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };
  
  // 渲染主页生成步骤内容
  const renderIndexContent = (data: any) => {
    const files = data.files || [];
    const htmlFile = files.find((f: any) => f.name === 'index.html');
    const cssFile = files.find((f: any) => f.name === 'styles.css');
    const jsFile = files.find((f: any) => f.name === 'scripts.js');
    
    return (
      <div className="space-y-3">
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
          <h4 className="font-medium text-green-700 dark:text-green-300 mb-1">📄 主页生成完成</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            生成了 {files.length} 个文件
          </p>
        </div>
        
        {expanded && (
          <div className="space-y-3">
            {htmlFile && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-medium flex justify-between items-center">
                  <span>index.html</span>
                  <div className="flex space-x-1">
                    <button 
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" 
                      title="复制代码"
                      onClick={() => {
                        navigator.clipboard.writeText(htmlFile.content);
                        // 可以添加复制成功的提示
                      }}
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button 
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" 
                      title="在新窗口预览"
                      onClick={() => {
                        const newWindow = window.open();
                        if (newWindow) {
                          newWindow.document.write(htmlFile.content);
                          newWindow.document.close();
                        }
                      }}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="max-h-60 overflow-auto p-2 bg-white dark:bg-gray-900">
                  <iframe 
                    srcDoc={htmlFile.content} 
                    className="w-full h-48 border-0" 
                    title="预览"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              {cssFile && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-medium flex justify-between items-center">
                    <span>styles.css</span>
                    <button 
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" 
                      title="复制代码"
                      onClick={() => navigator.clipboard.writeText(cssFile.content)}
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <pre className="text-xs overflow-auto max-h-28 p-2 bg-white dark:bg-gray-900">
                    {cssFile.content.slice(0, 200)}
                    {cssFile.content.length > 200 && '...'}
                  </pre>
                </div>
              )}
              
              {jsFile && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-medium flex justify-between items-center">
                    <span>scripts.js</span>
                    <button 
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" 
                      title="复制代码"
                      onClick={() => navigator.clipboard.writeText(jsFile.content)}
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <pre className="text-xs overflow-auto max-h-28 p-2 bg-white dark:bg-gray-900">
                    {jsFile.content.slice(0, 200)}
                    {jsFile.content.length > 200 && '...'}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // 渲染内容页面生成步骤
  const renderContentContent = (data: any) => {
    const { fileIndex, filename, title, progress, description, contentData } = data;
    const files = contentData.files || [];
    const htmlFile = files.find((f: any) => f.name === filename);
    
    return (
      <div className="space-y-3">
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md">
          <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-1">
            📄 页面生成完成: {filename}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {title || '未命名页面'}
          </p>
          
          {/* 添加进度显示 */}
          {progress && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>生成进度：{progress.percent}%</span>
                <span>{progress.current}/{progress.total}</span>
              </div>
              <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${progress.percent}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        {expanded && description && (
          <div className="p-2 text-xs bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
          </div>
        )}
        
        {expanded && htmlFile && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-medium flex justify-between items-center">
              <span>{filename}</span>
              <div className="flex space-x-1">
                <button 
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" 
                  title="复制代码"
                  onClick={() => navigator.clipboard.writeText(htmlFile.content)}
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button 
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" 
                  title="在新窗口预览"
                  onClick={() => {
                    const newWindow = window.open();
                    if (newWindow) {
                      newWindow.document.write(htmlFile.content);
                      newWindow.document.close();
                    }
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="max-h-60 overflow-auto p-2 bg-white dark:bg-gray-900">
              <iframe 
                srcDoc={htmlFile.content} 
                className="w-full h-48 border-0" 
                title="预览"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // 新增：渲染生成摘要内容
  const renderSummaryContent = (data: any) => {
    const { totalFiles, fileNames, mainFile, timeElapsed, isSinglePage } = data;
    
    return (
      <div className="space-y-3">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-md">
          <div className="flex items-center">
            <div className="bg-indigo-100 dark:bg-indigo-800 p-2 rounded-full mr-3">
              <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div>
              <h4 className="font-medium text-indigo-700 dark:text-indigo-300 mb-1">
                生成完成
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isSinglePage 
                  ? '已生成单页网站' 
                  : `已生成多页网站，共 ${totalFiles} 个文件`}
              </p>
            </div>
          </div>
          
          {/* 生成时间统计 */}
          <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-800/50">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                耗时
              </span>
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                {formatTime(timeElapsed)}
              </span>
            </div>
          </div>
        </div>
        
        {expanded && totalFiles > 1 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 text-xs font-medium">
              生成的文件列表
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {fileNames.map((name: string, index: number) => (
                <li key={index} className="px-3 py-2 flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    {name === mainFile ? (
                      <Layout className="w-4 h-4 text-blue-500 mr-2" />
                    ) : name.endsWith('.css') ? (
                      <Code className="w-4 h-4 text-pink-500 mr-2" />
                    ) : name.endsWith('.js') ? (
                      <Code className="w-4 h-4 text-yellow-500 mr-2" />
                    ) : (
                      <FileText className="w-4 h-4 text-gray-500 mr-2" />
                    )}
                    <span className="text-gray-700 dark:text-gray-300">{name}</span>
                  </div>
                  {name === mainFile && (
                    <span className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded">主页</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  // 格式化时间，将秒转换为分钟和秒
  const formatTime = (seconds: number): string => {
    if (!seconds && seconds !== 0) return '--:--';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          {response.step === 'planning' && <Server className="w-4 h-4 text-blue-500" />}
          {response.step === 'index' && <Layout className="w-4 h-4 text-green-500" />}
          {response.step === 'content' && <FileText className="w-4 h-4 text-purple-500" />}
          {response.step === 'summary' && <Check className="w-4 h-4 text-indigo-500" />}
          <h3 className="text-sm font-medium">
            {response.step === 'planning' && '网站规划'}
            {response.step === 'index' && '主页生成'}
            {response.step === 'content' && `内容页面生成 (${(response.data as any).filename || ''})`}
            {response.step === 'summary' && '生成摘要'}
          </h3>
          {response.timestamp && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(response.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          )}
        </div>
        <button
          onClick={toggleExpand}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'transform rotate-180' : ''}`} />
        </button>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {renderContent()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 步骤连接器组件
function StepConnector() {
  return (
    <div className="flex justify-center my-3">
      <div className="w-0.5 h-12 bg-gradient-to-b from-gray-200 via-blue-200 to-gray-200 dark:from-gray-700 dark:via-blue-700 dark:to-gray-700 flex items-center justify-center">
        <div className="absolute w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-sm">
          <ChevronDown className="w-4 h-4 text-blue-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function ChatInterface({
  userInput,
  isGenerating,
  generationStatus,
  generationProgress,
  generationTotal,
  generationMessage,
  generatedHtml,
  error,
  onRegenerate,
  generatedFiles = null,
  isMultiFile = false,
  apiResponses = []
}: ChatInterfaceProps) {
  // 内部状态
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMessageContainerExpanded, setIsMessageContainerExpanded] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [typingSpeed, setTypingSpeed] = useState<number>(30); // 打字速度，单位为毫秒
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlanningComplete, setIsPlanningComplete] = useState<boolean>(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // 自动显示预览 - 当生成完成时
  useEffect(() => {
    if (generationStatus === 'complete' && generatedHtml) {
      // 自动显示预览，不需要用户点击按钮
      setShowPreview(true);
      // 可选：最小化消息容器，让预览更突出
      setIsMessageContainerExpanded(false);
    }
  }, [generationStatus, generatedHtml]);

  // 找到规划响应
  const planningResponse = apiResponses.find(r => r.step === 'planning');

  // 当API响应变化时检查规划状态
  useEffect(() => {
    // 如果有规划响应，设置规划完成状态
    if (planningResponse) {
      setIsPlanningComplete(true);
    }
  }, [planningResponse]);

  // 注入自定义样式
  useEffect(() => {
    // 创建style元素
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles.highlightPulse;
    styleElement.id = 'chat-interface-styles';
    
    // 确保不重复添加
    if (!document.getElementById('chat-interface-styles')) {
      document.head.appendChild(styleElement);
    }
    
    // 组件卸载时移除样式
    return () => {
      const existingStyle = document.getElementById('chat-interface-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // 当userInput变化时，更新用户消息
  useEffect(() => {
    if (userInput.trim()) {
      // 只在初始化时添加用户消息
      if (messages.length === 0) {
        setMessages([{
          id: 'user-input',
          content: userInput,
          type: 'user',
          timestamp: new Date()
        }]);
      }
    }
  }, [userInput]);

  // 当生成状态变化时，更新AI消息
  useEffect(() => {
    const handleStatusChange = () => {
      let newMessages: Message[] = [...messages];
      
      // 根据不同的生成状态，添加或更新消息
      switch (generationStatus) {
        case 'planning':
          // 添加系统消息，表示开始分析
          newMessages.push({
            id: 'system-planning',
            content: '正在分析您的内容并规划网站结构...',
            type: 'system',
            timestamp: new Date()
          });
          break;
          
        case 'generating':
          // 检查是否已有生成中的消息
          const generatingIdx = newMessages.findIndex(m => m.id === 'system-generating');
          if (generatingIdx >= 0) {
            // 更新现有消息
            newMessages[generatingIdx] = {
              ...newMessages[generatingIdx],
              content: generationMessage || '正在生成您的网页...'
            };
          } else {
            // 添加新的生成中消息
            newMessages.push({
              id: 'system-generating',
              content: generationMessage || '正在生成您的网页...',
              type: 'system',
              timestamp: new Date()
            });
          }
          
          // 如果有进度信息，添加或更新进度消息
          if (generationTotal > 0) {
            const progressIdx = newMessages.findIndex(m => m.id === 'system-progress');
            const progressMsg = `进度：${generationProgress}/${generationTotal} 文件完成 (${Math.round((generationProgress / generationTotal) * 100)}%)`;
            
            if (progressIdx >= 0) {
              // 更新现有进度消息
              newMessages[progressIdx] = {
                ...newMessages[progressIdx],
                content: progressMsg
              };
            } else {
              // 添加新的进度消息
              newMessages.push({
                id: 'system-progress',
                content: progressMsg,
                type: 'system',
                timestamp: new Date()
              });
            }
          }
          break;
          
        case 'complete':
          // 移除生成中和进度消息
          newMessages = newMessages.filter(m => 
            m.id !== 'system-generating' && m.id !== 'system-progress'
          );
          
          // 添加完成消息
          newMessages.push({
            id: 'system-complete',
            content: '✅ 您的网页已成功生成！',
            type: 'system',
            timestamp: new Date()
          });
          
          // 如果有生成的HTML，添加代码示例 - 使用requestAnimationFrame避免界面卡顿
          if (generatedHtml) {
            // 使用requestAnimationFrame延迟执行，避免界面卡顿
            requestAnimationFrame(() => {
              setTimeout(() => {
                // 为了UI美观，只显示HTML的前200个字符作为预览
                const previewHtml = generatedHtml.slice(0, 300) + 
                  (generatedHtml.length > 300 ? '...' : '');
                
                setMessages(prevMessages => [
                  ...prevMessages,
                  {
                    id: 'code-preview',
                    content: previewHtml,
                    type: 'code',
                    timestamp: new Date(),
                    displayContent: '',
                    isComplete: false
                  }
                ]);
              }, 300); // 延迟300ms执行，给界面渲染留出时间
            });
            
            // 提前返回，避免立即更新state
            return;
          }
          break;
          
        case 'error':
          // 添加错误消息
          if (error) {
            newMessages.push({
              id: 'system-error',
              content: `❌ 发生错误：${error}`,
              type: 'system',
              timestamp: new Date()
            });
          }
          break;
      }
      
      setMessages(newMessages);
    };
    
    handleStatusChange();
    
  }, [generationStatus, generationMessage, generationProgress, generationTotal, generatedHtml, error]);

  // 处理代码消息的打字机效果
  useEffect(() => {
    const codeMessages = messages.filter(m => 
      m.type === 'code' && m.displayContent !== undefined && !m.isComplete
    );
    
    if (codeMessages.length > 0) {
      const message = codeMessages[0];
      
      // 清除之前的定时器
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      
      // 如果显示内容未完全，则继续打字
      if (message.displayContent!.length < message.content.length) {
        typingTimerRef.current = setTimeout(() => {
          setMessages(prev => prev.map(m => {
            if (m.id === message.id) {
              const nextChar = message.content.charAt(message.displayContent!.length);
              const newDisplayContent = message.displayContent + nextChar;
              
              // 如果是最后一个字符，标记为完成
              const isComplete = newDisplayContent.length >= message.content.length;
              
              return {
                ...m,
                displayContent: newDisplayContent,
                isComplete
              };
            }
            return m;
          }));
        }, typingSpeed);
      }
    }
    
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [messages, typingSpeed]);

  // 当消息更新时，自动滚动到底部
  useEffect(() => {
    if (isMessageContainerExpanded && !showPreview) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMessageContainerExpanded, showPreview]);

  // 当API响应变化时更新消息
  useEffect(() => {
    if (apiResponses.length > 0) {
      // 使用函数式更新，不依赖于当前的messages状态
      setMessages(prevMessages => {
        // 创建一个新的消息数组
        const newMessages: Message[] = [];
        
        // 始终包含用户消息
        const userMsg = prevMessages.find(m => m.id === 'user-input');
        if (userMsg) {
          newMessages.push(userMsg);
        }
        
        // 添加API响应消息
        apiResponses.forEach((response, index) => {
          // 为每个步骤添加系统消息
          let systemMessage: Message;
          
          switch (response.step) {
            case 'planning':
              systemMessage = {
                id: `system-${response.step}`,
                content: isPlanningComplete 
                  ? '✅ 内容分析和规划已完成！' 
                  : '正在分析您的内容并规划网站结构...',
                type: 'system',
                timestamp: new Date()
              };
              break;
              
            case 'index':
              systemMessage = {
                id: `system-${response.step}`,
                content: '网站规划完成，正在生成主页...',
                type: 'system',
                timestamp: new Date()
              };
              break;
              
            case 'content':
              const { fileIndex, filename } = response.data;
              systemMessage = {
                id: `system-${response.step}-${fileIndex}`,
                content: `正在生成页面：${filename}`,
                type: 'system',
                timestamp: new Date()
              };
              break;
              
            default:
              systemMessage = {
                id: `system-${response.step}`,
                content: '正在处理...',
                type: 'system',
                timestamp: new Date()
              };
          }
          
          // 添加系统消息
          newMessages.push(systemMessage);
          
          // 添加API响应消息
          newMessages.push({
            id: `api-${response.step}-${index}`,
            content: '',
            type: 'api-response',
            timestamp: new Date(),
            apiResponse: response,
            // 如果不是最后一个响应，添加nextStep
            ...(index < apiResponses.length - 1 ? { nextStep: apiResponses[index + 1].step } : {})
          });
        });
        
        // 如果生成已完成，添加完成消息
        if (generationStatus === 'complete') {
          newMessages.push({
            id: 'system-complete',
            content: '✅ 您的网页已成功生成！',
            type: 'system',
            timestamp: new Date()
          });
        } 
        // 如果出错，添加错误消息
        else if (generationStatus === 'error' && error) {
          newMessages.push({
            id: 'system-error',
            content: `❌ ${error}`,
            type: 'system',
            timestamp: new Date(),
            // 针对API响应超时或网络错误，提供重试选项
            ...(error.includes('超时') || error.includes('网络问题') || error.includes('服务暂时不可用') 
               ? { retryAvailable: true } : {})
          });
        }
        
        return newMessages;
      });
    }
  }, [apiResponses, generationStatus, error, isPlanningComplete]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 头部导航 */}
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => onRegenerate()} 
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="ml-2 text-lg font-medium text-gray-900 dark:text-gray-100">
          {isGenerating ? '网页生成中' : generationStatus === 'error' ? '生成出错' : '网页生成完成'}
        </h2>
      </div>
      
      {/* 主要内容区域 */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {/* 生成中或错误状态提示 */}
        {(isGenerating || generationStatus === 'error') && !showPreview && (
          <motion.div 
            className="flex flex-col items-center justify-center flex-grow py-8 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm max-w-md w-full">
              {generationStatus === 'planning' || generationStatus === 'generating' ? (
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500">
                    <Loader2 className="animate-pulse" size={24} />
                  </div>
                </div>
              ) : generationStatus === 'complete' ? (
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                  <Check className="text-green-500" size={32} />
                </div>
              ) : generationStatus === 'error' ? (
                <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
                  <AlertTriangle className="text-red-500" size={32} />
              </div>
              ) : null}
              
              <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-gray-100">
                {generationStatus === 'planning' ? '正在分析内容' : 
                 generationStatus === 'generating' ? '生成中' : 
                 generationStatus === 'complete' ? '生成完成' : 
                 generationStatus === 'error' ? '生成出错' : ''}
              </h3>
              
              <p className="mt-2 text-gray-500 dark:text-gray-400 text-center">
                {generationStatus === 'planning' ? '我们正在分析您的内容并创建网站规划...' : 
                 generationStatus === 'generating' ? generationMessage || '我们正在为您创建网页，请稍候...' : 
                 generationStatus === 'complete' ? '您的网页已成功生成！' : 
                 generationStatus === 'error' ? error || '生成过程中发生错误，请重试' : ''}
              </p>
              
              {generationProgress > 0 && generationTotal > 0 && (
                <div className="mt-4 w-full">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-blue-500 h-2.5 rounded-full" 
                      style={{ width: `${Math.round((generationProgress / generationTotal) * 100)}%` }}
                    ></div>
            </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                    {generationProgress}/{generationTotal} 文件完成
                  </p>
                </div>
              )}
              
              {generationStatus === 'error' && error && (
                error.includes('超时') || error.includes('网络问题') || error.includes('服务暂时不可用') || error.includes('请稍后再试')
              ) && (
                <button
                  onClick={onRegenerate}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <RefreshCw size={16} className="mr-2" />
                  重试
                </button>
              )}
            </div>
          </motion.div>
        )}
        
        {/* 消息列表容器 */}
        <AnimatePresence>
          {isMessageContainerExpanded && (
            <motion.div 
              className="flex-grow overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 space-y-6">
                {/* 消息列表已在前面实现 */}
              </div>
            </motion.div>
      )}
        </AnimatePresence>
      
        {/* 预览容器 */}
      <AnimatePresence mode="wait">
          {showPreview && generatedHtml && (
          <motion.div 
            key="preview-container"
              className="flex-grow bg-white dark:bg-gray-900 overflow-auto w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
                <HtmlPreview 
                  html={generatedHtml} 
                  isMultiFile={isMultiFile} 
                  files={generatedFiles} 
                />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
} 