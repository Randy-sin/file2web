'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, ExternalLink, ChevronDown } from 'lucide-react';
import { triggerPageTransition } from './PageTransition';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

export default function Hero() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [animationsLoaded, setAnimationsLoaded] = useState(false);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 鼠标移动事件节流函数
  const throttle = (callback: Function, delay: number) => {
    if (throttleTimeoutRef.current) return;
    
    throttleTimeoutRef.current = setTimeout(() => {
      callback();
      throttleTimeoutRef.current = null;
    }, delay);
  };

  // 处理鼠标移动，用于视差效果，加入节流控制
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      throttle(() => {
        setMousePosition({
          x: e.clientX / window.innerWidth - 0.5,
          y: e.clientY / window.innerHeight - 0.5
        });
      }, 50); // 50ms节流
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // 延迟加载次要动画
    const timer = setTimeout(() => {
      setAnimationsLoaded(true);
    }, 600); // 主要内容加载后再加载装饰性动画

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
      clearTimeout(timer);
    };
  }, []);

  const handleStartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerPageTransition('/convert', router);
  };

  // 公司网站链接
  const companyLinks = {
    anthropic: 'https://www.anthropic.com',
    openai: 'https://www.openai.com',
    monica: 'https://fas.st/t/jLQ5oxov'
  };

  // 打开外部链接
  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 滚动到下一部分
  const scrollToNextSection = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 简化动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1 // 减少延迟
      }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 }, // 减少位移距离
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" } // 简化动画曲线和持续时间
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      {/* 背景渐变 - 保留，不影响性能 */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
      
      {/* 动态背景元素 - 保留主要元素，但减少动画复杂度 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl"
          animate={{ 
            x: mousePosition.x * -15,
            y: mousePosition.y * -15
          }}
          transition={{ type: "spring", damping: 100, stiffness: 50 }} // 降低动画频率
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-300/5 dark:bg-yellow-300/5 rounded-full blur-3xl"
          style={{ minHeight: '800px' }} // 预留高度避免布局偏移
          animate={{ 
            scale: [1, 1.03, 1],
          }}
          transition={{ 
            duration: 12, // 延长动画时间减少CPU占用
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        />
      </div>
      
      {/* 装饰性几何图形 - 延迟加载 */}
      {animationsLoaded && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-20 right-[10%] w-12 h-12 bg-blue-500 rounded-lg"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            style={{ 
              x: mousePosition.x * -10,
              y: mousePosition.y * -10
            }}
          />
          <motion.div 
            className="absolute bottom-32 left-[15%] w-8 h-8 bg-purple-500 rounded-full"
            initial={{ y: 0 }}
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            style={{ 
              x: mousePosition.x * 10,
              y: mousePosition.y * 10
            }}
          />
        </div>
      )}
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <motion.div variants={itemVariants}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                将文字转换为
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  精美网页
                </span>
              </h1>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0">
                File2Web 帮助您轻松将文字内容转换为精美的网页。无需编程知识，只需上传文字，AI 将为您生成专业的网页。
              </p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.a 
                href="/convert"
                onClick={handleStartClick}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full hover:shadow-lg transition-all group relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center justify-center">
                  开始使用
                  <motion.span 
                    className="inline-block ml-2"
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <ArrowRight size={18} />
                  </motion.span>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </motion.a>
              
              <motion.button 
                onClick={scrollToNextSection}
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-full border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all flex items-center justify-center group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                了解更多
                <motion.span 
                  className="inline-block ml-2"
                  animate={{ y: [0, 3, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ChevronDown size={18} />
                </motion.span>
              </motion.button>
            </motion.div>
            
            {/* 特点标签 - 保留但简化动画 */}
            <motion.div 
              variants={itemVariants}
              className="mt-12 grid grid-cols-2 gap-4 max-w-lg mx-auto lg:mx-0"
            >
              {[
                { 
                  icon: "✦", 
                  title: "简约现代设计", 
                  description: "精心设计的界面，突显内容的同时保持美观"
                },
                { 
                  icon: "⟁", 
                  title: "响应式布局", 
                  description: "完美适配各种设备，从手机到桌面显示器"
                },
                { 
                  icon: "◎", 
                  title: "多页面支持", 
                  description: "轻松创建包含多个页面的完整网站"
                },
                { 
                  icon: "⤓", 
                  title: "一键发布", 
                  description: "快速部署您的网站，立即分享给全世界"
                }
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className="relative p-5 rounded-xl backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 bg-white/5 dark:bg-gray-800/5 overflow-hidden group"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <div className="absolute -right-2 -top-2 text-4xl font-light text-gray-200/30 dark:text-gray-700/30 group-hover:text-blue-500/20 dark:group-hover:text-blue-400/20 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          <div className="w-full lg:w-1/2">
            <motion.div 
              className="relative mx-auto max-w-lg"
              variants={itemVariants}
            >
              {/* 主图像 - 预留空间避免布局偏移 */}
              <div className="relative" style={{ height: '290px', width: '100%' }}>
                <motion.div 
                  className="rounded-2xl shadow-2xl overflow-hidden absolute inset-0"
                  transition={{ type: "spring", stiffness: 200 }}
                  style={{ 
                    x: mousePosition.x * -10,
                    y: mousePosition.y * -10,
                  }}
                >
                  <Image 
                    src="/example.png" 
                    alt="File2Web 示例" 
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="w-full h-auto"
                    style={{color: 'transparent'}}
                    priority
                  />
                </motion.div>
                <motion.div 
                  className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/3 z-20"
                  style={{ 
                    x: mousePosition.x * 10,
                    y: mousePosition.y * 10,
                  }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <div className="relative">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg max-w-[180px] text-left">
                      <div className="text-blue-600 dark:text-blue-400 font-mono text-xs whitespace-nowrap">
                        &lt;div<br />
                        class="container"&gt;<br />
                        &nbsp;&nbsp;您的内容在这里<br />
                        &lt;/div&gt;
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* 装饰元素 - 延迟加载 */}
              {animationsLoaded && (
                <>
                  <motion.div 
                    className="absolute -bottom-6 -left-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg w-24 h-24 transform -rotate-6 shadow-lg"
                    animate={{ 
                      rotate: [-6, 0, -6],
                      scale: [1, 1.03, 1]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    style={{ 
                      x: mousePosition.x * 15,
                      y: mousePosition.y * 15
                    }}
                  />
                  <motion.div 
                    className="absolute -top-6 -right-6 bg-yellow-400 rounded-full w-16 h-16 shadow-lg z-10"
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    style={{ 
                      x: mousePosition.x * -15,
                      y: mousePosition.y * -15
                    }}
                  />
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
        
        {/* 信任标志 - 延迟加载 */}
        <motion.div 
          className="mt-16 md:mt-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: animationsLoaded ? 1 : 0, y: animationsLoaded ? 0 : 20 }}
          transition={{ duration: 0.8 }}
        >
          <motion.p 
            className="text-sm text-gray-500 dark:text-gray-400 mb-6"
          >
            受到信赖的技术支持
          </motion.p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-16 items-center">
            {[
              { name: 'Monica', logo: '/monica.jpg', link: companyLinks.monica },
              { name: 'Anthropic', logo: '/anthropic_logo.svg', link: companyLinks.anthropic },
              { name: 'OpenAI', logo: '/openai_logo.png', link: companyLinks.openai }
            ].map((company, index) => (
              <motion.button 
                key={index}
                onClick={() => openExternalLink(company.link)}
                className="h-12 md:h-14 flex items-center justify-center group relative"
                aria-label={`访问 ${company.name} 官网`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: animationsLoaded ? 1 : 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
              >
                <Image 
                  src={company.logo} 
                  alt={`${company.name} Logo`} 
                  width={120} 
                  height={40} 
                  className="h-8 md:h-10 w-auto object-contain transition-all duration-300"
                  loading="lazy"
                />
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center whitespace-nowrap">
                  访问{company.name}官网 <ExternalLink size={12} className="ml-1" />
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
        
        {/* 向下滚动指示器 - 延迟加载 */}
        {animationsLoaded && (
          <motion.div 
            className="absolute bottom-16 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              onClick={scrollToNextSection}
              className="flex flex-col items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-sm mb-2">向下滚动</span>
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ChevronDown size={24} />
              </motion.div>
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
} 