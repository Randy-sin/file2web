'use client';

import { useState, useEffect } from 'react';
import TextEditor from '@/components/TextEditor';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import AdManager from '@/components/AdManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, FileText, Wand2, Sparkles, CheckCircle2, Code, Terminal, Braces, Zap, Brain, Layers, Cpu, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ConvertPage() {
  const [activeTab, setActiveTab] = useState('editor');
  const [isInView, setIsInView] = useState(false);
  
  // 监听滚动，当组件进入视图时触发动画
  useEffect(() => {
    setIsInView(true);
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );
    
    const section = document.getElementById('convert-hero');
    if (section) {
      observer.observe(section);
    }
    
    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);
  
  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-grow pt-20">
        {/* 顶部英雄区域 - 现代AI公司风格 */}
        <section id="convert-hero" className="py-20 relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20 -z-10"></div>
          
          {/* 装饰性几何图形 */}
          <div className="absolute top-20 right-[5%] w-96 h-96 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-20 left-[5%] w-96 h-96 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-100/10 to-purple-100/10 dark:from-blue-900/5 dark:to-purple-900/5 rounded-full blur-3xl -z-10"></div>
          
          <div className="container mx-auto px-4 relative">
            <motion.div 
              className="max-w-5xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              <motion.div 
                className="text-center mb-12"
                variants={itemVariants}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">AI驱动</span>的文本到网页转换
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  输入您的文字内容，我们的AI将自动创建一个结构清晰、设计精美的网页，无需编程知识。
                </p>
              </motion.div>
              
              {/* 功能亮点 - 现代卡片设计 */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
                variants={itemVariants}
              >
                {[
                  {
                    icon: <Brain className="w-6 h-6 text-blue-500" />,
                    title: "AI智能分析",
                    description: "自动理解文本结构和内容，生成语义化HTML"
                  },
                  {
                    icon: <Layers className="w-6 h-6 text-purple-500" />,
                    title: "专业设计系统",
                    description: "应用现代UI设计原则，创建美观的响应式布局"
                  },
                  {
                    icon: <Cpu className="w-6 h-6 text-teal-500" />,
                    title: "高性能生成",
                    description: "支持长文本和复杂内容，生成多页面网站"
                  }
                ].map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                    whileHover={{ y: -5 }}
                  >
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 inline-block mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
              
              {/* 代码演示区域 - 替代图片 */}
              <motion.div 
                className="bg-gray-900 dark:bg-black rounded-2xl overflow-hidden shadow-2xl mb-16 border border-gray-800"
                variants={itemVariants}
              >
                <div className="h-10 bg-gray-800 flex items-center px-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="ml-4 text-xs text-gray-400">AI生成过程演示</div>
                </div>
                <div className="p-6 flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2">
                    <div className="text-sm text-gray-400 mb-2">输入文本</div>
                    <div className="font-mono text-sm text-gray-300 bg-gray-800 p-4 rounded-lg h-[200px] overflow-auto">
                      <TypewriterText text={`# 人工智能简介

人工智能(AI)是计算机科学的一个分支，致力于创造能够模拟人类智能的机器。

## 主要应用领域

- **自然语言处理**: 使计算机能够理解和生成人类语言
- **计算机视觉**: 使计算机能够"看见"并理解视觉信息
- **机器学习**: 使计算机能够从数据中学习并改进

## 未来发展

随着技术的不断进步，AI将在更多领域发挥重要作用...`} />
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <div className="text-sm text-gray-400 mb-2">生成的HTML</div>
                    <div className="font-mono text-sm text-blue-300 bg-gray-800 p-4 rounded-lg h-[200px] overflow-auto">
                      <TypewriterText 
                        text={`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>人工智能简介</title>
  <style>
    :root {
      --primary: #3b82f6;
      --text: #1f2937;
      --background: #ffffff;
    }
    body {
      font-family: 'Inter', sans-serif;
      line-height: 1.6;
      color: var(--text);
      background: var(--background);
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1 {
      color: var(--primary);
      font-size: 2.5rem;
    }
    /* 更多样式... */
  </style>
</head>
<body>
  <header>
    <h1>人工智能简介</h1>
  </header>
  <main>
    <p>人工智能(AI)是计算机科学的一个分支，致力于创造能够模拟人类智能的机器。</p>
    
    <h2>主要应用领域</h2>
    <ul>
      <li><strong>自然语言处理</strong>: 使计算机能够理解和生成人类语言</li>
      <li><strong>计算机视觉</strong>: 使计算机能够"看见"并理解视觉信息</li>
      <li><strong>机器学习</strong>: 使计算机能够从数据中学习并改进</li>
    </ul>
    
    <h2>未来发展</h2>
    <p>随着技术的不断进步，AI将在更多领域发挥重要作用...</p>
  </main>
  <footer>
    <!-- 页脚内容 -->
  </footer>
</body>
</html>`} 
                        delay={1000}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* 社会证明 - 现代设计 */}
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-16"
                variants={itemVariants}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-medium ring-2 ring-white dark:ring-gray-800">JD</div>
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 text-xs font-medium ring-2 ring-white dark:ring-gray-800">WL</div>
                      <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-600 dark:text-teal-400 text-xs font-medium ring-2 ring-white dark:ring-gray-800">ZM</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">1,200+ 用户已使用</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">来自各行各业的专业人士</div>
                    </div>
                  </div>
                  <div className="flex-1 px-6 border-l border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-300 italic">"简单几步就生成了一个精美的网页，太神奇了！AI的能力令人惊叹。"</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">— 张明，独立开发者</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {/* 主要内容区域 - 使用选项卡提供更多功能 */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="editor" className="w-full max-w-5xl mx-auto" onValueChange={setActiveTab}>
              <div className="flex justify-center mb-8">
                <TabsList className="grid grid-cols-3 w-full max-w-md bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                  <TabsTrigger value="editor" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
                    <FileText size={16} />
                    <span>文本编辑器</span>
                  </TabsTrigger>
                  <TabsTrigger value="examples" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
                    <Sparkles size={16} />
                    <span>用户案例</span>
                  </TabsTrigger>
                  <TabsTrigger value="tips" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm">
                    <CheckCircle2 size={16} />
                    <span>使用技巧</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="editor" className="focus:outline-none">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <TextEditor />
                </div>
              </TabsContent>
              
              <TabsContent value="examples" className="focus:outline-none">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">用户成功案例展示</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 用户案例卡片 */}
                    {[
                      { 
                        title: 'DeepSeek-R1官网', 
                        description: 'AI模型技术展示官网',
                        url: 'https://jqevvi6gr8.yourware.so/',
                        image: '/example1-deepseek.png',
                        icon: <Brain size={24} />,
                        color: 'from-blue-500 to-cyan-500'
                      },
                      { 
                        title: '小红书开发者平台', 
                        description: '独立开发者生态与扶持政策',
                        url: 'https://42ti5ytla5.yourware.so/',
                        image: '/example2-rednote.png',
                        icon: <Code size={24} />,
                        color: 'from-purple-500 to-pink-500'
                      },
                      { 
                        title: 'Polaroid相机官网', 
                        description: '复古拍立得相机产品展示',
                        url: 'https://novc6limig.yourware.so/',
                        image: '/example3-polaris.png',
                        icon: <Sparkles size={24} />,
                        color: 'from-amber-500 to-orange-500'
                      },
                      { 
                        title: 'Crypto Knowledge', 
                        description: '加密货币与Web3知识学习平台',
                        url: 'https://woqffa3oz9.yourware.so/',
                        image: '/example4-crypto.png',
                        icon: <Braces size={24} />,
                        color: 'from-emerald-500 to-teal-500'
                      },
                      { 
                        title: '京都旅游指南', 
                        description: '日本京都旅行攻略与景点介绍',
                        url: 'https://ehe9lf1kzt.yourware.so/',
                        image: '/example5-tokyo.png',
                        icon: <Terminal size={24} />,
                        color: 'from-rose-500 to-red-500'
                      },
                      { 
                        title: '美食记忆网站', 
                        description: '全球美食文化与烹饪技巧分享',
                        url: 'https://1ubefo93uv.yourware.so/',
                        image: '/example6-food.png',
                        icon: <Zap size={24} />,
                        color: 'from-indigo-500 to-violet-500'
                      }
                    ].map((example, index) => (
                      <motion.div 
                        key={index} 
                        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group"
                        whileHover={{ y: -5 }}
                        onClick={() => window.open(example.url, '_blank')}
                      >
                        <div className="h-48 relative overflow-hidden">
                          <Image 
                            src={example.image} 
                            alt={example.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                            className="object-cover transition-transform group-hover:scale-105"
                            priority={index < 2}
                            loading={index < 2 ? "eager" : "lazy"}
                            quality={90}
                            unoptimized={example.image === '/example1-deepseek.png' || example.image === '/example6-food.png'}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                            <div className="p-1.5 rounded-lg bg-white/90 text-gray-800">
                              {example.icon}
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{example.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{example.description}</p>
                          <div className="flex items-center text-xs text-blue-500 mt-2">
                            <span className="truncate">{example.url}</span>
                            <ExternalLink size={12} className="ml-1 flex-shrink-0" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="tips" className="focus:outline-none">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">使用技巧</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        title: "结构化您的内容",
                        description: "使用标题、段落和列表来组织您的内容，这样 AI 可以更好地理解内容结构。",
                        icon: <Layers className="w-6 h-6 text-blue-500" />
                      },
                      {
                        title: "使用高精度模式",
                        description: "对于较长的内容，建议使用高精度模式，可以生成更加丰富的多页面网站。",
                        icon: <Zap className="w-6 h-6 text-purple-500" />
                      },
                      {
                        title: "添加关键词",
                        description: "在内容中添加关键词和主题，帮助 AI 更准确地理解您想要的风格和重点。",
                        icon: <Terminal className="w-6 h-6 text-teal-500" />
                      },
                      {
                        title: "预览和调整",
                        description: "生成网页后，使用预览功能查看效果，并根据需要调整内容再次生成。",
                        icon: <Cpu className="w-6 h-6 text-amber-500" />
                      }
                    ].map((tip, index) => (
                      <motion.div 
                        key={index} 
                        className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-all"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                            {tip.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{tip.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{tip.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* 底部帮助链接 */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                不确定如何使用？查看我们的<Link href="/#how-it-works" className="text-blue-600 hover:underline">使用指南</Link>或查看<button onClick={() => setActiveTab('examples')} className="text-blue-600 hover:underline">用户案例</button>。
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      {/* 广告管理器 - 在首页使用横幅广告 */}
      <AdManager forceShow="banner" />
    </div>
  );
}

// 打字机效果组件
interface TypewriterTextProps {
  text: string;
  delay?: number;
}

function TypewriterText({ text, delay = 0 }: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let currentIndex = 0;
    let currentText = '';
    
    const startTyping = () => {
      timeout = setTimeout(() => {
        if (currentIndex < text.length) {
          currentText += text[currentIndex];
          setDisplayText(currentText);
          currentIndex++;
          startTyping();
        }
      }, 20); // 打字速度
    };
    
    const delayTimeout = setTimeout(() => {
      startTyping();
    }, delay);
    
    return () => {
      clearTimeout(timeout);
      clearTimeout(delayTimeout);
    };
  }, [text, delay]);
  
  return (
    <div className="whitespace-pre-wrap">
      {displayText}
      <span className="inline-block w-2 h-4 bg-blue-500 dark:bg-blue-400 animate-pulse ml-1"></span>
    </div>
  );
} 