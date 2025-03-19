'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ExternalLink } from 'lucide-react';

interface AdBannerProps {
  onClose: () => void;
}

export default function AdBanner({ onClose }: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'bottom' | 'side'>('bottom');

  useEffect(() => {
    // 检测屏幕宽度，决定广告位置
    const handleResize = () => {
      setPosition(window.innerWidth > 768 ? 'side' : 'bottom');
    };
    
    // 初始化
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // 添加进入动画
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleTryClick = () => {
    window.open('https://fas.st/t/5LToZkih', '_blank', 'noopener,noreferrer');
    onClose();
  };

  // 底部横幅样式
  const bottomBannerClasses = `
    fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-30
    border-t border-gray-200 dark:border-gray-700
    transform transition-transform duration-300 ease-in-out
    ${isVisible ? 'translate-y-0' : 'translate-y-full'}
  `;
  
  // 侧边栏样式
  const sideBannerClasses = `
    fixed top-1/3 right-0 bg-white dark:bg-gray-800 shadow-lg z-30
    border-l border-t border-b border-gray-200 dark:border-gray-700
    rounded-l-lg
    transform transition-transform duration-300 ease-in-out
    ${isVisible ? 'translate-x-0' : 'translate-x-full'}
  `;

  return (
    <div className={position === 'bottom' ? bottomBannerClasses : sideBannerClasses}>
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="关闭广告"
      >
        <X size={16} />
      </button>
      
      {position === 'bottom' ? (
        // 底部横幅布局
        <div className="flex items-center justify-between p-3 max-w-6xl mx-auto">
          <div className="flex items-center">
            <Image 
              src="/monica_logo.png" 
              alt="Monica Logo" 
              width={32} 
              height={32} 
              className="mr-3 hidden sm:block"
            />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Monica AI - 免费使用满血可联网DeepSeek R1
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 hidden sm:block">
                一站式 AI 助手，个性化，便捷，免费
              </p>
            </div>
          </div>
          <button
            onClick={handleTryClick}
            className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-md hover:shadow-md transition-all flex items-center"
          >
            试试 <ExternalLink size={14} className="ml-1" />
          </button>
        </div>
      ) : (
        // 侧边栏布局
        <div className="p-4 w-64">
          <div className="flex items-center mb-3">
            <Image 
              src="/monica_logo.png" 
              alt="Monica Logo" 
              width={24} 
              height={24} 
              className="mr-2"
            />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Monica AI
            </h3>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
            免费使用满血可联网DeepSeek R1，一站式 AI 助手，个性化，便捷，免费
          </p>
          <button
            onClick={handleTryClick}
            className="w-full px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-md hover:shadow-md transition-all flex items-center justify-center"
          >
            立即体验 <ExternalLink size={14} className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
} 