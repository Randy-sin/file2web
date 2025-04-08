'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import { Suspense, lazy } from 'react';
import { ArrowRight } from 'lucide-react';
import { triggerPageTransition } from '@/components/PageTransition';
import dynamic from 'next/dynamic';

// 动态导入非关键组件
const Features = dynamic(() => import('@/components/Features'), {
  loading: () => <div className="h-[300px] w-full"></div>,
  ssr: false // 不在服务端渲染，减少初始加载时间
});

const HowItWorks = dynamic(() => import('@/components/HowItWorks'), {
  loading: () => <div className="h-[300px] w-full"></div>,
  ssr: false
});

const Footer = dynamic(() => import('@/components/Footer'), {
  ssr: true // 保持服务端渲染，因为footer是重要的页面元素
});

const AdManager = dynamic(() => import('@/components/AdManager'), {
  ssr: false
});

export default function Home() {
  const router = useRouter();

  const handleStartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerPageTransition('/convert', router);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <Hero />
        
        <Suspense fallback={<div className="h-[300px] w-full"></div>}>
          <Features />
        </Suspense>
        
        <Suspense fallback={<div className="h-[300px] w-full"></div>}>
          <HowItWorks />
        </Suspense>
      </main>
      
      <Footer />
      
      {/* 广告管理器 - 在首页使用横幅广告 */}
      <AdManager forceShow="banner" />
    </div>
  );
}
