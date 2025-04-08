'use client';

import { useState, useEffect } from 'react';
import { ContentType, DesignStylePreset } from '@/lib/prompts';
import { Check, ChevronDown, FileType, Palette, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentOptionsProps {
  contentType: ContentType | undefined;
  designStyle: DesignStylePreset | undefined;
  onContentTypeChange: (type: ContentType) => void;
  onDesignStyleChange: (style: DesignStylePreset) => void;
  onAutoDetect: () => void;
  text: string;
  isLoading: boolean;
  className?: string;
}

export default function ContentOptions({
  contentType,
  designStyle,
  onContentTypeChange,
  onDesignStyleChange,
  onAutoDetect,
  text,
  isLoading,
  className = '',
}: ContentOptionsProps) {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [designStyles, setDesignStyles] = useState<DesignStylePreset[]>([]);
  const [isContentTypeDropdownOpen, setIsContentTypeDropdownOpen] = useState(false);
  const [isDesignStyleDropdownOpen, setIsDesignStyleDropdownOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  // 获取可用的内容类型和设计风格
  useEffect(() => {
    async function fetchOptions() {
      try {
        const response = await fetch('/api/content-options');
        if (!response.ok) {
          console.error('获取内容选项失败:', response.statusText);
          return;
        }
        
        const data = await response.json();
        setContentTypes(data.contentTypes || []);
        setDesignStyles(data.designStyles || []);
      } catch (error) {
        console.error('获取内容选项出错:', error);
      }
    }
    
    fetchOptions();
  }, []);

  // 将内容类型枚举转换为显示名称
  const getContentTypeName = (type: ContentType): string => {
    switch (type) {
      case ContentType.BLOG_POST:
        return '博客文章';
      case ContentType.PRODUCT_DESCRIPTION:
        return '产品描述';
      case ContentType.TECHNICAL_DOCUMENTATION:
        return '技术文档';
      case ContentType.ACADEMIC_PAPER:
        return '学术论文';
      case ContentType.PERSONAL_RESUME:
        return '个人简历';
      case ContentType.COMPANY_INTRODUCTION:
        return '公司介绍';
      default:
        return '未知类型';
    }
  };

  // 将设计风格枚举转换为显示名称
  const getDesignStyleName = (style: DesignStylePreset): string => {
    switch (style) {
      case DesignStylePreset.MINIMAL_MODERN:
        return '简约现代';
      case DesignStylePreset.CORPORATE_PROFESSIONAL:
        return '企业专业';
      case DesignStylePreset.CREATIVE_PLAYFUL:
        return '创意活泼';
      case DesignStylePreset.ACADEMIC_FORMAL:
        return '学术正式';
      case DesignStylePreset.TECHNICAL_DOCUMENTATION:
        return '技术文档';
      default:
        return '未知风格';
    }
  };

  // 执行自动检测
  const handleAutoDetect = async () => {
    if (!text || text.trim().length < 50) return;
    
    setIsDetecting(true);
    try {
      await onAutoDetect();
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      {/* 内容类型选择 */}
      <div className="relative flex-1">
        <div className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 flex items-center">
          <FileType className="inline-block w-4 h-4 mr-1" /> 
          内容类型
        </div>
        <div 
          className={`relative border rounded-md p-2 cursor-pointer flex items-center justify-between ${
            isContentTypeDropdownOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-800`}
          onClick={() => setIsContentTypeDropdownOpen(!isContentTypeDropdownOpen)}
        >
          <span className="text-sm truncate">
            {contentType ? getContentTypeName(contentType) : '选择内容类型'}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
        
        {isContentTypeDropdownOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-300 dark:border-gray-600 max-h-60 overflow-auto"
          >
            {contentTypes.map((type) => (
              <div
                key={type}
                className={`p-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center ${
                  contentType === type ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                }`}
                onClick={() => {
                  onContentTypeChange(type);
                  setIsContentTypeDropdownOpen(false);
                }}
              >
                {contentType === type && <Check className="w-4 h-4 mr-1" />}
                <span className="ml-1">{getContentTypeName(type)}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
      
      {/* 设计风格选择 */}
      <div className="relative flex-1">
        <div className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 flex items-center">
          <Palette className="inline-block w-4 h-4 mr-1" /> 
          设计风格
        </div>
        <div 
          className={`relative border rounded-md p-2 cursor-pointer flex items-center justify-between ${
            isDesignStyleDropdownOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-800`}
          onClick={() => setIsDesignStyleDropdownOpen(!isDesignStyleDropdownOpen)}
        >
          <span className="text-sm truncate">
            {designStyle ? getDesignStyleName(designStyle) : '选择设计风格'}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
        
        {isDesignStyleDropdownOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-300 dark:border-gray-600 max-h-60 overflow-auto"
          >
            {designStyles.map((style) => (
              <div
                key={style}
                className={`p-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center ${
                  designStyle === style ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                }`}
                onClick={() => {
                  onDesignStyleChange(style);
                  setIsDesignStyleDropdownOpen(false);
                }}
              >
                {designStyle === style && <Check className="w-4 h-4 mr-1" />}
                <span className="ml-1">{getDesignStyleName(style)}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
      
      {/* 自动检测按钮 */}
      <button
        type="button"
        className={`px-3 py-2 rounded-md text-sm flex items-center justify-center mt-5 ${
          text && text.trim().length >= 50 && !isLoading
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-800/40'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
        }`}
        onClick={handleAutoDetect}
        disabled={!text || text.trim().length < 50 || isLoading || isDetecting}
      >
        {isDetecting ? (
          <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4 mr-1" />
        )}
        <span>自动检测</span>
      </button>
    </div>
  );
} 