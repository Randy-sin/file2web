import { motion } from 'framer-motion';
import { FileText, Wand2, Download, Layout, Smartphone, Zap, Code, Globe, Terminal, Braces, Layers } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Features() {
  // 容器动画变体
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

  // 子元素动画变体
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  // 主要功能
  const primaryFeatures = [
    {
      icon: <Wand2 className="w-6 h-6 text-blue-500" />,
      title: 'AI 智能生成',
      description: '利用先进的Monica AI技术，智能分析文本内容并转化为结构化网页',
      gradient: 'from-blue-500/20 to-indigo-500/20'
    },
    {
      icon: <Layout className="w-6 h-6 text-purple-500" />,
      title: '专业设计系统',
      description: '采用现代设计系统，确保生成的网页具有专业的视觉效果和用户体验',
      gradient: 'from-purple-500/20 to-pink-500/20'
    },
    {
      icon: <Globe className="w-6 h-6 text-green-500" />,
      title: '多页面网站',
      description: '支持创建包含多个页面的完整网站，适合构建更复杂的内容结构',
      gradient: 'from-green-500/20 to-teal-500/20'
    }
  ];

  // 技术特性
  const technicalFeatures = [
    {
      icon: <Code className="w-5 h-5 text-gray-700 dark:text-gray-300" />,
      title: '语义HTML结构',
      description: '生成符合W3C标准的语义化HTML，提升SEO表现和可访问性'
    },
    {
      icon: <Smartphone className="w-5 h-5 text-gray-700 dark:text-gray-300" />,
      title: '响应式设计',
      description: '自适应各种屏幕尺寸，从移动设备到大型显示器均有最佳体验'
    },
    {
      icon: <Zap className="w-5 h-5 text-gray-700 dark:text-gray-300" />,
      title: '性能优化',
      description: '优化资源加载和渲染性能，确保网页加载速度快且流畅'
    },
    {
      icon: <Download className="w-5 h-5 text-gray-700 dark:text-gray-300" />,
      title: '部署选项',
      description: '支持一键下载或直接发布，轻松分享您的网站'
    }
  ];

  // 交互式代码示例状态
  const [activeStep, setActiveStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  // 模拟代码示例
  const codeExamples = [
    {
      title: "输入文本",
      icon: <FileText className="w-5 h-5" />,
      code: `# 输入您的文本内容

## 关于我们

我们是一家专注于人工智能应用的科技公司，致力于为用户提供简单易用的AI工具。

## 我们的服务

- 数据分析与可视化
- 自然语言处理
- 智能内容生成
- 定制化AI解决方案`,
      language: "markdown"
    },
    {
      title: "AI分析",
      icon: <Braces className="w-5 h-5" />,
      code: `// AI分析过程
function analyzeContent(text) {
  // 提取结构和关键信息
  const structure = extractStructure(text);
  
  // 识别内容类型和主题
  const contentType = identifyContentType(text);
  
  // 生成设计建议
  const designSuggestions = generateDesignSuggestions(
    structure, 
    contentType
  );
  
  return { structure, contentType, designSuggestions };
}`,
      language: "javascript"
    },
    {
      title: "生成网页",
      icon: <Layers className="w-5 h-5" />,
      code: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI科技公司</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="header">
    <nav class="nav">
      <div class="logo">AI科技</div>
      <ul class="menu">
        <li><a href="#about">关于我们</a></li>
        <li><a href="#services">服务</a></li>
        <li><a href="#contact">联系我们</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <section id="about" class="section">
      <h2>关于我们</h2>
      <p>我们是一家专注于人工智能应用的科技公司，
         致力于为用户提供简单易用的AI工具。</p>
    </section>
    
    <!-- 更多内容... -->
  </main>
</body>
</html>`,
      language: "html"
    }
  ];
  
  // 自动切换代码示例
  useEffect(() => {
    const typingTimer = setTimeout(() => {
      setIsTyping(true);
      
      const typingDuration = codeExamples[activeStep].code.length * 15; // 根据代码长度计算打字时间
      
      setTimeout(() => {
        setIsTyping(false);
        
        // 切换到下一个示例
        const nextTimer = setTimeout(() => {
          setActiveStep((prev) => (prev + 1) % codeExamples.length);
        }, 1000);
        
        return () => clearTimeout(nextTimer);
      }, typingDuration);
    }, 500);
    
    return () => clearTimeout(typingTimer);
  }, [activeStep]);

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 overflow-hidden">
      <div className="container mx-auto px-4 relative">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl"></div>
        </div>
        
        {/* 标题区域 */}
        <motion.div 
          className="text-center mb-20 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            智能技术，<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">卓越体验</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            我们的技术不仅仅是将文字转换为网页，而是创造出专业、现代且用户友好的数字体验。
          </p>
        </motion.div>
        
        {/* 主要功能展示 */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {primaryFeatures.map((feature, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-50`}></div>
              <div className="relative p-8">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-md flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* 技术展示区域 */}
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* 左侧交互式代码展示 - 替换原来的图片 */}
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900 border border-gray-800">
              {/* 模拟终端顶部栏 */}
              <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex items-center space-x-2">
                  {codeExamples.map((example, index) => (
                    <button 
                      key={index}
                      onClick={() => setActiveStep(index)}
                      className={`flex items-center px-3 py-1 rounded-md text-xs ${
                        activeStep === index 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <span className="mr-1.5">{example.icon}</span>
                      {example.title}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 代码展示区域 */}
              <div className="p-6 h-[350px] overflow-hidden font-mono text-sm">
                {/* 代码内容 */}
                <motion.pre
                  key={activeStep}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`text-left overflow-auto h-full ${
                    codeExamples[activeStep].language === 'html' 
                      ? 'text-orange-300' 
                      : codeExamples[activeStep].language === 'javascript'
                        ? 'text-yellow-300'
                        : 'text-blue-300'
                  }`}
                >
                  <code className="block whitespace-pre">
                    {isTyping 
                      ? codeExamples[activeStep].code.substring(0, Math.floor(Math.random() * codeExamples[activeStep].code.length))
                      : codeExamples[activeStep].code}
                  </code>
                </motion.pre>
                
                {/* 模拟光标 */}
                {isTyping && (
                  <motion.div 
                    className="w-2 h-5 bg-white inline-block"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
              </div>
              
              {/* 底部状态栏 */}
              <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 flex justify-between items-center">
                <div className="flex items-center">
                  <Terminal className="w-4 h-4 mr-2" />
                  <span>File2Web AI 处理引擎</span>
                </div>
                <div>
                  {activeStep === 0 ? '分析输入' : activeStep === 1 ? '处理中...' : '生成完成'}
                </div>
              </div>
            </div>
            
            {/* 交互提示 */}
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              点击上方按钮查看不同阶段的代码示例
            </div>
          </motion.div>
          
          {/* 右侧技术特性 */}
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              专为开发者和设计师打造的技术
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              我们的技术栈结合了最新的Web标准和设计趋势，确保生成的网页不仅美观，还具有出色的技术性能。
            </p>
            
            <div className="space-y-6">
              {technicalFeatures.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <div className="mt-1 mr-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* 底部CTA */}
        <motion.div 
          className="mt-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block px-6 py-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium mb-6">
            立即体验强大功能
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 max-w-2xl mx-auto">
            将您的文字内容转换为专业网页，只需几秒钟
          </h3>
          <a 
            href="/convert" 
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
          >
            开始创建
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
} 