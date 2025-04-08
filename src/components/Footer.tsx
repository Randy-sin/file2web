import Link from 'next/link';
import { Globe } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Footer() {
  // Animation variants
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
    <footer className="relative bg-gradient-to-b from-gray-900 to-black text-white py-16 overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-30"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {/* Logo and description section - wider on desktop */}
          <motion.div className="md:col-span-5" variants={itemVariants}>
            <div className="flex items-center space-x-4 mb-5">
              <div className="relative group">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                <div className="relative bg-black rounded-full p-1">
                  <Image 
                    src="/file2web.png" 
                    alt="File2Web Logo" 
                    width={64} 
                    height={64} 
                    className="h-12 w-auto"
                  />
                </div>
              </div>
              <h3 className="text-2xl font-light tracking-tight">File2Web</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              一个简单易用的工具，帮助您将文字内容转换为精美的网页。利用AI技术，我们为您的内容创造美观、响应式的网页设计，无需编程知识。
            </p>
          </motion.div>
          
          {/* Quick links section */}
          <motion.div className="md:col-span-3 md:ml-auto" variants={itemVariants}>
            <h3 className="text-sm font-medium uppercase tracking-wider text-gray-300 mb-5">快速链接</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm inline-block relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-white after:transition-all hover:after:w-full">
                  首页
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm inline-block relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-white after:transition-all hover:after:w-full">
                  功能
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm inline-block relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-white after:transition-all hover:after:w-full">
                  使用方法
                </Link>
              </li>
            </ul>
          </motion.div>
          
          {/* Follow us section */}
          <motion.div className="md:col-span-4" variants={itemVariants}>
            <h3 className="text-sm font-medium uppercase tracking-wider text-gray-300 mb-5">关注我们</h3>
            <div className="flex space-x-6">
              <a href="https://xxxxl-ai.vercel.app/" target="_blank" rel="noopener noreferrer" className="group" title="个人网站">
                <div className="w-10 h-10 rounded-full bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center transition-all duration-300 border border-gray-700 group-hover:border-gray-500">
                  <Globe size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </a>
              <a href="https://m.okjike.com/users/4208D501-FFCB-4A39-80DB-03831634CF74" target="_blank" rel="noopener noreferrer" className="group" title="即刻">
                <div className="w-10 h-10 rounded-full bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center transition-all duration-300 border border-gray-700 group-hover:border-gray-500">
                  <Image 
                    src="/jike.png" 
                    alt="即刻" 
                    width={20} 
                    height={20} 
                    className="w-5 h-5 object-contain opacity-60 group-hover:opacity-100 transition-all"
                  />
                </div>
              </a>
              <a href="https://www.xiaohongshu.com/user/profile/6421ad3f0000000012013587" target="_blank" rel="noopener noreferrer" className="group" title="小红书">
                <div className="w-10 h-10 rounded-full bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center transition-all duration-300 border border-gray-700 group-hover:border-gray-500">
                  <Image 
                    src="/rednote.png" 
                    alt="小红书" 
                    width={20} 
                    height={20} 
                    className="w-5 h-5 object-contain opacity-60 group-hover:opacity-100 transition-all"
                  />
                </div>
              </a>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Bottom copyright section with modern separator */}
        <div className="mt-16 pt-8 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          <motion.div 
            className="flex flex-col md:flex-row items-center justify-between text-gray-500 text-xs"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <p>&copy; {new Date().getFullYear()} File2Web. 保留所有权利。</p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link href="/privacy" className="hover:text-gray-300 cursor-pointer transition-colors">隐私政策</Link>
              <Link href="/terms" className="hover:text-gray-300 cursor-pointer transition-colors">使用条款</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
} 