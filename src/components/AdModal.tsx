'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdModal({ isOpen, onClose }: AdModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      // 延迟隐藏，以便动画完成
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const handleTryClick = () => {
    window.open('https://fas.st/t/5LToZkih', '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div 
      className={`fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-auto transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      {/* 背景虚化效果 - 不使用黑色遮罩，而是使用高斯模糊 */}
      <div className="absolute inset-0 backdrop-blur-md bg-transparent"></div>
      
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full p-6 relative z-10 transform transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <Image 
              src="/monica_logo.png" 
              alt="Monica Logo" 
              width={40} 
              height={40} 
              className="mr-3"
            />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Monica AI
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            通过Monica免费使用满血可联网DeepSeek R1?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            一站式 AI 助手，个性化，便捷，免费
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Monica利用尖端人工智能模型，包括DeepSeek R1、OpenAI σ1、GPT-4o、Claude 3.5和Gemini 1.5，来提升你的聊天、搜索、写作和强悍的联网能力。
          </p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleTryClick}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            马上试试
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-md transition-all hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 active:scale-95"
          >
            再等等
          </button>
        </div>
      </div>
    </div>
  );
} 