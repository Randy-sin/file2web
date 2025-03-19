'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface SplitViewProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  initialLeftWidth?: number; // 初始左侧宽度百分比
  minLeftWidth?: number; // 最小左侧宽度百分比
  maxLeftWidth?: number; // 最大左侧宽度百分比
  isGenerating?: boolean; // 生成中状态标志
  showBlurOverlay?: boolean; // 是否显示模糊遮罩
}

/**
 * SplitView组件
 * 
 * 实现左右分屏布局，支持拖动调整宽度
 */
export default function SplitView({
  leftContent,
  rightContent,
  initialLeftWidth = 40, // 默认40%
  minLeftWidth = 20, // 默认最小20%
  maxLeftWidth = 60, // 默认最大60%
  isGenerating = false,
  showBlurOverlay = true
}: SplitViewProps) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [previousWidth, setPreviousWidth] = useState(initialLeftWidth);
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理拖动开始
  const handleDragStart = () => {
    setIsDragging(true);
  };

  // 处理拖动
  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    // 获取容器位置和尺寸
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerLeft = containerRect.left;
    
    // 计算鼠标位置相对于容器的位置
    const mouseX = e.clientX - containerLeft;
    
    // 计算左侧宽度百分比
    let newLeftWidth = (mouseX / containerWidth) * 100;
    
    // 限制在最小值和最大值之间
    newLeftWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth));
    
    // 更新左侧宽度
    setLeftWidth(newLeftWidth);
  };

  // 处理拖动结束
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // 添加全局鼠标事件监听
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      // 获取容器位置和尺寸
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerLeft = containerRect.left;
      
      // 计算鼠标位置相对于容器的位置
      const mouseX = e.clientX - containerLeft;
      
      // 计算左侧宽度百分比
      let newLeftWidth = (mouseX / containerWidth) * 100;
      
      // 限制在最小值和最大值之间
      newLeftWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth));
      
      // 更新左侧宽度
      setLeftWidth(newLeftWidth);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    // 添加全局事件监听
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      // 移除全局事件监听
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minLeftWidth, maxLeftWidth]);

  /**
   * 切换折叠状态的函数
   * @unused 当前未使用，保留用于将来可能添加的折叠/展开功能
   */
  const toggleCollapse = () => {
    if (isCollapsed) {
      // 展开
      setLeftWidth(previousWidth);
    } else {
      // 折叠
      setPreviousWidth(leftWidth);
      setLeftWidth(0);
    }
    setIsCollapsed(!isCollapsed);
  };

  // 生成时自动调整布局
  useEffect(() => {
    if (isGenerating && !isCollapsed) {
      // 保存当前宽度并折叠
      setPreviousWidth(leftWidth);
      setLeftWidth(30); // 生成时将左侧宽度设为30%
    }
  }, [isGenerating, isCollapsed, leftWidth]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full overflow-hidden"
    >
      {/* 左侧内容 */}
      <motion.div
        className="h-full overflow-hidden"
        style={{ width: `${leftWidth}%` }}
        animate={{ width: `${leftWidth}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {leftContent}
      </motion.div>
      
      {/* 拖动条 */}
      <div
        className={`relative w-1 h-full bg-gray-300 dark:bg-gray-600 cursor-col-resize group hover:bg-blue-400 dark:hover:bg-blue-500 ${
          isDragging ? 'bg-blue-500 dark:bg-blue-600' : ''
        }`}
        onMouseDown={handleDragStart}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
      >
        {/* 手柄指示器 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-0.5 h-4 bg-gray-400 dark:bg-gray-300 mx-0.5"></div>
          <div className="w-0.5 h-4 bg-gray-400 dark:bg-gray-300 mx-0.5"></div>
        </div>
      </div>
      
      {/* 右侧内容 */}
      <motion.div
        className="h-full flex-1 overflow-hidden"
        animate={{ width: `${100 - leftWidth - 0.25}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {rightContent}
      </motion.div>
      
      {/* 生成中遮罩 */}
      {isGenerating && showBlurOverlay && (
        <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-[1px] pointer-events-none flex items-center justify-center">
          <div className="bg-white/80 dark:bg-black/80 rounded-full p-1 shadow-md">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
} 