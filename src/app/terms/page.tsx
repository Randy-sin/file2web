'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsOfService() {
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
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">使用条款</h1>
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
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">欢迎使用File2Web</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                感谢您使用我们的产品和服务（以下简称"服务"）。服务由File2Web提供。通过访问或使用我们的服务，您同意受这些条款的约束。请仔细阅读。
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">使用我们的服务</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                您必须遵守服务中提供的所有政策。请勿滥用我们的服务。例如，请勿干扰我们的服务或尝试使用除我们提供的接口和说明以外的方法访问这些服务。您仅能在法律（包括适用的出口和再出口管制法律和法规）允许的范围内使用我们的服务。
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                我们可能会暂停或停止向您提供服务，如果您未遵守我们的条款或政策，或者我们在调查可疑的不当行为。
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">您在File2Web中的内容</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                我们的服务允许您上传、提交、存储、发送或接收内容。您保留对该内容持有的任何知识产权的所有权。简而言之，属于您的内容依然归您所有。
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                当您上传、提交、存储、发送或接收内容至或通过我们的服务，您授予File2Web一项全球性的许可，允许我们使用、托管、存储、复制、修改、创建衍生作品（例如，我们为了使您的内容更好地与我们的服务配合而进行的翻译、改编或其他更改）、传播、发布、公开演示、公开展示和分发此类内容。您在此许可中授予的权利，仅限用于运营、推广和改进我们的服务，以及开发新的服务。
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">使用限制</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                您不得使用我们的服务：
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6 space-y-2">
                <li>上传、传输或分发任何违反法律或侵犯他人权利的内容</li>
                <li>上传或传输计算机病毒、恶意软件或任何其他旨在破坏或限制任何软件、硬件或通信设备功能的代码</li>
                <li>干扰或中断服务或服务所在的服务器和网络</li>
                <li>收集或存储其他用户的个人数据，除非得到其明确许可</li>
                <li>使用服务进行欺诈、误导或欺骗</li>
                <li>尝试未经授权访问、干扰、破坏或扰乱服务的任何部分</li>
              </ul>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">服务变更</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                File2Web会不断变更和改进服务。我们可能会添加或移除功能或特性，也可能会暂停或彻底停止提供服务。您可以随时停止使用服务，尽管我们对此表示遗憾。File2Web也可以随时停止向您提供服务，或随时对服务增加或设置新的限制。
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">责任限制</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                在法律允许的范围内，File2Web及其供应商和分销商不对利润损失、收入损失或数据、财务损失或间接、特殊、后果性、惩戒性损害赔偿负责。
                <br /><br />
                在法律允许的范围内，我们的全部责任限额为您支付给我们使用相关服务的金额（或者，如果我们选择，再次向您提供相关服务）。
                <br /><br />
                在任何情况下，File2Web及其供应商和分销商对于任何无法合理预见的损失或损害不承担责任。
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">商业使用</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                如果您代表某家企业使用我们的服务，该企业必须接受这些条款。该企业将保证对因使用服务或违反这些条款而导致的任何索赔、诉讼或法律行动（包括任何合理的律师费用）向File2Web及其关联公司、高管、代理人和员工进行赔偿并使其免受损害。
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">关于这些条款</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                我们可能会修改这些条款或适用于服务的任何附加条款，例如反映法律的变更或我们服务的变化。您应当定期查阅这些条款。我们会在本页上发布对这些条款的修改通知。我们会在相关服务中公布对附加条款的修改通知。变更将不会追溯适用，并将在公布变更后至少十四天后生效。
                <br /><br />
                但是，对服务新功能的变更或出于法律原因而进行的变更将立即生效。如果您不同意服务的修改条款，应停止使用该服务。
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">联系我们</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                如果您对这些服务条款有任何问题或疑虑，请通过以下方式联系我们：<br />
                邮箱：contact@file2web.com
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