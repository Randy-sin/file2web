'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ContentType, DesignStylePreset } from '@/lib/prompts';

/**
 * 现代文本编辑器 - 基于OpenAI和Apple的设计风格
 * 
 * 该组件提供了一个优雅现代的文本编辑界面，用于输入和处理内容
 */
export default function ModernTextEditor() {
  // 状态管理
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentType, setContentType] = useState<ContentType | undefined>(undefined);
  const [designStyle, setDesignStyle] = useState<DesignStylePreset | undefined>(undefined);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light');
  const [showSettings, setShowSettings] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 设计风格选项
  const designStyles = [
    { id: 'minimal_modern', name: '简约现代' },
    { id: 'corporate_professional', name: '商务专业' },
    { id: 'creative_playful', name: '创意活泼' },
    { id: 'academic_formal', name: '学术正式' },
    { id: 'technical_documentation', name: '技术文档' },
  ];
  
  // 内容类型选项
  const contentTypes = [
    { id: 'blog_post', name: '博客文章' },
    { id: 'product_description', name: '产品描述' },
    { id: 'technical_documentation', name: '技术文档' },
    { id: 'academic_paper', name: '学术论文' },
    { id: 'personal_resume', name: '个人简历' },
    { id: 'company_introduction', name: '公司介绍' },
  ];
  
  // 自动调整文本区域高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [text]);
  
  // 处理主题切换
  const toggleTheme = () => {
    setSelectedTheme(selectedTheme === 'light' ? 'dark' : 'light');
  };
  
  // 处理文本变化
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };
  
  // 处理生成网页
  const handleGenerate = async () => {
    if (!text.trim()) return;
    
    setIsGenerating(true);
    // 这里添加生成逻辑
    
    // 模拟生成过程
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };
  
  // 自动检测内容类型
  const handleAutoDetect = () => {
    // 实际应用中这里应该调用API进行内容检测
    // 这里使用模拟的检测结果
    setContentType('blog_post' as ContentType);
    setDesignStyle('minimal_modern' as DesignStylePreset);
  };

  return (
    <div className={`w-full transition-all duration-300 ${selectedTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto p-6">
        {/* 顶部栏 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
            文本编辑器
          </h1>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${
                selectedTheme === 'dark' 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {selectedTheme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full transition-colors ${
                showSettings 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
                  : selectedTheme === 'dark' 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* 主要编辑区域 */}
          <div className={`${showSettings ? 'w-full md:w-2/3' : 'w-full'}`}>
            <div className={`rounded-2xl overflow-hidden ${
              selectedTheme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200 shadow-sm'
            }`}>
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                placeholder="请在此输入您想要转换为网页的文本内容..."
                className={`w-full p-5 min-h-[300px] focus:outline-none resize-none ${
                  selectedTheme === 'dark' 
                    ? 'bg-gray-800 text-gray-100 placeholder-gray-500' 
                    : 'bg-white text-gray-800 placeholder-gray-400'
                }`}
              ></textarea>
              
              <div className={`flex justify-between items-center p-4 border-t ${
                selectedTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="text-sm text-gray-500">
                  {text.length > 0 ? `${text.length} 字符` : ''}
                </div>
                
                <button
                  onClick={handleAutoDetect}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                    selectedTheme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                    <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                    <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                  自动检测
                </button>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={handleGenerate}
                disabled={!text.trim() || isGenerating}
                className={`w-full py-3 rounded-xl font-medium transition-colors ${
                  !text.trim() || isGenerating
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    正在生成...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21"></path>
                      <path d="M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3"></path>
                      <path d="M17.5 12C17.5 14.7614 15.2614 17 12.5 17"></path>
                      <path d="M12.5 17C9.73858 17 7.5 14.7614 7.5 12C7.5 9.23858 9.73858 7 12.5 7"></path>
                      <path d="M12.5 7C15.2614 7 17.5 9.23858 17.5 12"></path>
                      <polyline points="11 15 15 12 11 9"></polyline>
                    </svg>
                    生成网页
                  </div>
                )}
              </button>
            </div>
          </div>
          
          {/* 侧边设置面板 */}
          {showSettings && (
            <div className="w-full md:w-1/3">
              <div className={`rounded-2xl p-5 h-full transition-colors ${
                selectedTheme === 'dark' 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}>
                <h2 className="text-lg font-semibold mb-5">生成设置</h2>
                
                <div className="space-y-6">
                  {/* 内容类型选择 */}
                  <div>
                    <label className="block text-sm font-medium mb-2">内容类型</label>
                    <div className={`p-1 grid grid-cols-2 gap-2 rounded-xl ${
                      selectedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      {contentTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setContentType(type.id as ContentType)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            contentType === type.id
                              ? 'bg-blue-500 text-white'
                              : selectedTheme === 'dark'
                                ? 'text-gray-300 hover:bg-gray-600'
                                : 'text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {type.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* 设计风格选择 */}
                  <div>
                    <label className="block text-sm font-medium mb-2">设计风格</label>
                    <div className="space-y-2">
                      {designStyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setDesignStyle(style.id as DesignStylePreset)}
                          className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${
                            designStyle === style.id
                              ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                              : selectedTheme === 'dark'
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-700'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <span className="flex-1">{style.name}</span>
                          {designStyle === style.id && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* 其他生成选项 */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">其他选项</h3>
                    <div className="space-y-3">
                      <label className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                        selectedTheme === 'dark' ? 'bg-gray-700' : 'bg-white border border-gray-200'
                      }`}>
                        <span className="text-sm">自动格式化文本</span>
                        <div className="relative">
                          <input type="checkbox" className="sr-only" defaultChecked={true} />
                          <div className={`block w-10 h-6 rounded-full transition-colors ${
                            selectedTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                          }`}></div>
                          <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                        </div>
                      </label>
                      
                      <label className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                        selectedTheme === 'dark' ? 'bg-gray-700' : 'bg-white border border-gray-200'
                      }`}>
                        <span className="text-sm">数据可视化</span>
                        <div className="relative">
                          <input type="checkbox" className="sr-only" defaultChecked={true} />
                          <div className={`block w-10 h-6 rounded-full transition-colors ${
                            selectedTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                          }`}></div>
                          <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 底部提示信息 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          您可以输入任何文本内容，AI将自动分析并创建一个精美的网页
        </div>
      </div>
    </div>
  );
}