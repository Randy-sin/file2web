'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';
import { ArrowRight } from 'lucide-react';
import { triggerPageTransition } from '@/components/PageTransition';
import AdManager from '@/components/AdManager';

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
        
        <Features />
        
        <HowItWorks />
      </main>
      
      <Footer />
      
      {/* 广告管理器 - 在首页使用横幅广告 */}
      <AdManager forceShow="banner" />
    </div>
  );
}
