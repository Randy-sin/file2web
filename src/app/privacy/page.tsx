'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
  // 渐入动画设置
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      } 
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* 页面标题 */}
          <div className="mb-12 text-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">隐私政策</h1>
            <p className="text-gray-600 dark:text-gray-400">最后更新: {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          {/* 内容区域 */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">概述</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                欢迎使用File2Web服务。本隐私政策旨在帮助您了解我们如何收集、使用、存储和保护您的个人信息。我们重视您的隐私，并致力于保护您的个人数据。使用我们的服务即表示您同意本隐私政策中描述的数据实践。
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">信息收集</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                我们可能收集以下类型的信息：
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6 space-y-2">
                <li><strong>账户信息</strong>：当您注册账户时，我们会收集您的用户名、电子邮件地址和密码。</li>
                <li><strong>文本内容</strong>：您输入到我们系统中用于转换为网页的文本内容。</li>
                <li><strong>使用数据</strong>：有关您如何使用我们服务的信息，如访问时间、使用的功能和生成的网页。</li>
                <li><strong>设备信息</strong>：浏览器类型、操作系统和IP地址等技术数据。</li>
              </ul>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">信息使用</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                我们使用收集的信息用于：
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6 space-y-2">
                <li>提供、维护和改进我们的服务</li>
                <li>创建和管理您的账户</li>
                <li>处理您的请求并生成网页内容</li>
                <li>向您发送通知和更新</li>
                <li>分析使用模式以改进用户体验</li>
                <li>检测、防止和解决技术问题或安全问题</li>
              </ul>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">数据存储与安全</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                我们采取适当的技术和组织措施来保护您的个人数据不受意外丢失、未经授权的访问、使用、更改或披露。所有数据传输都通过SSL加密，存储的数据采用行业标准的加密技术。但请注意，没有任何在线传输或电子存储方法是100%安全的。
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">信息共享</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                我们不会出售或出租您的个人信息。我们可能在以下情况下共享您的信息：
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6 space-y-2">
                <li><strong>服务提供商</strong>：我们使用第三方服务提供商帮助我们提供服务，如云存储和分析服务。</li>
                <li><strong>法律要求</strong>：如果法律要求我们这样做，或者我们相信这样做是必要的，我们可能会披露您的信息。</li>
                <li><strong>业务转让</strong>：如果我们参与合并、收购或资产出售，您的信息可能被转让。</li>
                <li><strong>征得同意</strong>：在您同意的情况下，我们可能与第三方共享您的信息。</li>
              </ul>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">您的权利</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                根据您所在地区适用的法律，您可能拥有以下权利：
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6 space-y-2">
                <li>访问我们持有的关于您的个人信息</li>
                <li>更正不准确或不完整的信息</li>
                <li>删除您的个人数据</li>
                <li>限制或反对我们处理您的个人数据</li>
                <li>数据可携带性</li>
                <li>撤回您的同意</li>
              </ul>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Cookie政策</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                我们使用Cookie和类似技术来提升您的使用体验、分析网站流量和个性化内容。您可以通过浏览器设置控制Cookie的使用，但这可能会影响某些功能的可用性。
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">儿童隐私</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                我们的服务不面向13岁以下的儿童。我们不会故意收集13岁以下儿童的个人信息。如果您是父母或监护人，并且您认为您的孩子向我们提供了个人信息，请联系我们。
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">政策更新</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                我们可能会不时更新本隐私政策。当我们进行重大更改时，我们将在网站上发布通知，并更新页面顶部的"最后更新"日期。我们鼓励您定期查看本政策以了解我们如何保护您的信息。
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">联系我们</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                如果您对本隐私政策有任何问题或疑虑，请通过以下方式联系我们：<br />
                邮箱：randyxian08@gmail.com
              </p>
            </motion.div>
            
            {/* 返回按钮 */}
            <motion.div 
              className="mt-10 text-center"
              variants={itemVariants}
            >
              <Link 
                href="/" 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                返回首页
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 