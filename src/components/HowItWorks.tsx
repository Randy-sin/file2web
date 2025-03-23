'use client';

import { motion } from 'framer-motion';
import { ArrowRight, MousePointer, Eye, Download, FileText } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

export default function HowItWorks() {
  const [isInView, setIsInView] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 监听滚动，当组件进入视图时触发动画和延迟加载视频
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          
          // 当组件进入视图后，延迟加载视频
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.src = "/file2webexample.mp4";
              videoRef.current.load();
            }
          }, 1000); // 延迟1秒加载视频，优先加载其他内容
        }
      },
      { threshold: 0.2 }
    );
    
    const section = document.getElementById('how-it-works');
    if (section) {
      observer.observe(section);
    }
    
    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);
  
  // 处理视频加载完成事件
  const handleVideoLoaded = () => {
    setVideoLoaded(true);
  };
  
  // 简化动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };
  
  const steps = [
    {
      number: '01',
      title: '输入文字内容',
      description: '在文本编辑器中输入您的文字内容，或者上传文本文件。',
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      number: '02',
      title: '点击生成按钮',
      description: '点击"生成网页"按钮，AI 将自动分析您的内容并生成网页。',
      icon: <MousePointer className="w-6 h-6 text-purple-500" />,
      color: 'from-purple-500 to-pink-600'
    },
    {
      number: '03',
      title: '预览生成结果',
      description: '预览生成的网页效果，确认内容和样式是否符合您的需求。',
      icon: <Eye className="w-6 h-6 text-teal-500" />,
      color: 'from-teal-500 to-emerald-600'
    },
    {
      number: '04',
      title: '下载网页文件',
      description: '满意后，点击下载按钮获取所有网页文件，随时可以部署使用。',
      icon: <Download className="w-6 h-6 text-amber-500" />,
      color: 'from-amber-500 to-orange-600'
    }
  ];

  const throttle = (callback: () => void, delay: number) => {
    if (throttleTimeoutRef.current) return;
    
    throttleTimeoutRef.current = setTimeout(() => {
      callback();
      throttleTimeoutRef.current = null;
    }, delay);
  };

  const throttleCallback = () => {
    if (throttleTimeoutRef.current) return;
    
    throttleTimeoutRef.current = setTimeout(() => {
      handleVideoLoaded();
      throttleTimeoutRef.current = null;
    }, 1000);
  };

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 -z-10"></div>
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-white to-transparent dark:from-gray-900 dark:to-transparent -z-10"></div>
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white to-transparent dark:from-gray-900 dark:to-transparent -z-10"></div>
      
      {/* 装饰性几何图形 - 只在视图内才显示 */}
      {isInView && (
        <>
          <div className="absolute top-20 right-[5%] w-64 h-64 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-20 left-[5%] w-64 h-64 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl -z-10"></div>
        </>
      )}
      
      <div className="container mx-auto px-4 relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            如何使用
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            只需简单几步，即可将您的文字内容转换为精美的网页。
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-20"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {steps.map((step, index) => (
            <motion.div key={index} className="relative" variants={itemVariants}>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 h-full border border-gray-100 dark:border-gray-700 shadow-lg shadow-gray-100/20 dark:shadow-gray-900/30 backdrop-blur-sm relative z-10 group hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                {/* 数字标识 */}
                <div className="absolute -top-5 -left-2 w-14 h-14 flex items-center justify-center">
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${step.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                  <span className="relative text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">{step.number}</span>
                </div>
                
                {/* 图标 */}
                <div className="mb-6 mt-4 flex items-center">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${step.color} bg-opacity-10 dark:bg-opacity-20`}>
                    {step.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
                
                {/* 连接线 - 简化动画，减少计算量 */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-0">
                    <motion.div 
                      className="w-12 h-[2px] bg-gradient-to-r from-blue-500 to-transparent"
                      initial={{ width: 0 }}
                      animate={isInView ? { width: 48 } : { width: 0 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    />
                    <motion.div 
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-blue-500"
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                    >
                      <ArrowRight size={16} />
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {/* 装饰性背景元素 - 只在视图内才显示 */}
          {isInView && (
            <>
              <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 dark:from-teal-500/20 dark:to-emerald-500/20 rounded-full blur-3xl -z-10 transform -translate-x-1/2 translate-y-1/2"></div>
            </>
          )}
          
          <div className="flex flex-col md:flex-row items-stretch p-8 md:p-12">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <h3 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                  简单易用，效果出众
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                  File2Web 使用先进的 AI 技术，能够智能分析您的文字内容，生成结构清晰、设计精美的网页。
                  无论您是想创建个人博客、产品介绍页面还是企业官网，File2Web 都能满足您的需求。
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  您无需具备任何编程或设计知识，只需提供文字内容，剩下的交给我们。
                </p>
              </motion.div>
            </div>
            
            <div className="md:w-1/2">
              <motion.div 
                className="rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* 视频播放区域 - 简化层级结构 */}
                <div className="aspect-video relative bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  {/* 占位图片 */}
                  <Image
                    src="/example.png"
                    alt="File2Web 示例"
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className={`object-cover transition-opacity duration-300 ${videoLoaded ? 'opacity-0' : 'opacity-100'} z-10`}
                    priority={false}
                  />
                  
                  {/* 视频播放器，提高z-index确保可点击 */}
                  <video 
                    ref={videoRef}
                    preload="none"
                    controls
                    muted
                    loop
                    playsInline
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${videoLoaded ? 'opacity-100' : 'opacity-0'} z-20`}
                    poster="/example.png"
                    onLoadedData={throttleCallback}
                  />
                  
                  {/* 视频标题覆盖层，添加pointer-events-none避免干扰视频控件 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end z-10 pointer-events-none">
                    <div className="p-4 text-white">
                      <p className="text-sm font-medium">File2Web 演示视频</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 