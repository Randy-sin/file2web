'use client';

import { useState, useEffect, useRef } from 'react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [content, setContent] = useState(children);
  const initialRenderRef = useRef(true);

  // 监听路由变化
  useEffect(() => {
    const handleRouteChange = () => {
      setIsTransitioning(true);
      
      // 动画结束后重置状态
      setTimeout(() => {
        setIsTransitioning(false);
        setContent(children);
      }, 300); // 减少动画持续时间，从500ms减少到300ms
    };

    // 自定义事件监听
    window.addEventListener('page-transition', handleRouteChange as EventListener);
    
    return () => {
      window.removeEventListener('page-transition', handleRouteChange as EventListener);
    };
  }, [children]);

  // 处理页面加载时的动画
  useEffect(() => {
    // 跳过首次渲染的过渡动画，提高初始LCP
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      setContent(children);
      return;
    }
    
    setContent(children);
  }, [children]);

  // 为首次渲染提供无动画版本，后续路由变化才使用过渡动画
  return (
    <div 
      className={`${!initialRenderRef.current ? 'transition-opacity' : ''} ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ 
        transitionDuration: '300ms',
        transitionProperty: isTransitioning ? 'opacity' : 'none' 
      }}
    >
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
  }, 50); // 减少等待时间，从100ms减少到50ms
} 