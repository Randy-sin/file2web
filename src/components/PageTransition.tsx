'use client';

import { useState, useEffect } from 'react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [content, setContent] = useState(children);

  // 监听路由变化
  useEffect(() => {
    const handleRouteChange = () => {
      setIsTransitioning(true);
      
      // 动画结束后重置状态
      setTimeout(() => {
        setIsTransitioning(false);
        setContent(children);
      }, 500); // 与动画持续时间匹配
    };

    // 自定义事件监听
    window.addEventListener('page-transition', handleRouteChange as EventListener);
    
    return () => {
      window.removeEventListener('page-transition', handleRouteChange as EventListener);
    };
  }, [children]);

  // 处理页面加载时的动画
  useEffect(() => {
    setContent(children);
  }, [children]);

  return (
    <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {content}
    </div>
  );
}

// 触发页面过渡的辅助函数
export function triggerPageTransition(url: string, router: AppRouterInstance) {
  // 触发自定义事件
  window.dispatchEvent(new Event('page-transition'));
  
  // 延迟导航，等待动画开始
  setTimeout(() => {
    router.push(url);
  }, 100);
} 