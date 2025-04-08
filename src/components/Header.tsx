'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // 处理导航到首页特定部分的函数
  const handleNavigation = (sectionId: string) => {
    // 如果已经在首页，直接滚动到指定部分
    if (pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // 如果不在首页，先导航到首页，然后滚动到指定部分
      router.push(`/#${sectionId}`);
    }
    // 关闭移动菜单
    setIsMenuOpen(false);
  };

  // 处理页面加载后的锚点滚动
  useEffect(() => {
    if (pathname === '/' && window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [pathname]);

  // 监听滚动事件，改变导航栏样式
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 当菜单打开时，禁止页面滚动
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="flex items-center space-x-3 text-xl font-bold z-10">
            <Image 
              src="/file2web.png" 
              alt="File2Web Logo" 
              width={96} 
              height={96} 
              className={`transition-all duration-300 ${scrolled ? 'h-10 w-auto' : 'h-12 w-auto md:h-14'}`}
            />
            <span className={`transition-all duration-300 ${
              scrolled 
                ? 'text-xl text-gray-800 dark:text-white' 
                : 'text-2xl text-gray-800 dark:text-white md:text-3xl'
            }`}>File2Web</span>
          </Link>
        </motion.div>
        
        {/* 桌面导航 */}
        <motion.nav 
          className="hidden md:block"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ul className="flex space-x-8 items-center">
            {[
              { name: '首页', path: '/' },
              { name: '功能', action: () => handleNavigation('features') },
              { name: '使用方法', action: () => handleNavigation('how-it-works') },
              { name: '开始使用', path: '/convert' }
            ].map((item, index) => (
              <motion.li key={index} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center h-8">
                {item.path ? (
                  <Link 
                    href={item.path} 
                    className={`relative inline-flex items-center px-2 py-1 font-medium ${
                      scrolled 
                        ? 'text-gray-700 dark:text-gray-200' 
                        : 'text-gray-700 dark:text-white'
                    } hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-600 dark:after:bg-blue-400 after:transition-all after:duration-300`}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <button 
                    onClick={item.action} 
                    className={`relative inline-flex items-center px-2 py-1 font-medium ${
                      scrolled 
                        ? 'text-gray-700 dark:text-gray-200' 
                        : 'text-gray-700 dark:text-white'
                    } hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-blue-600 dark:after:bg-blue-400 after:transition-all after:duration-300`}
                  >
                    {item.name}
                  </button>
                )}
              </motion.li>
            ))}
          </ul>
        </motion.nav>
        
        {/* 移动端菜单按钮 */}
        <motion.button 
          className="md:hidden z-10 p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isMenuOpen ? (
            <X size={24} className="text-white" />
          ) : (
            <Menu size={24} className={scrolled ? 'text-gray-800 dark:text-white' : 'text-gray-800 dark:text-white'} />
          )}
        </motion.button>
        
        {/* 移动端菜单 */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-600 z-50 flex flex-col items-center justify-center"
              initial={{ opacity: 0, y: "-100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <nav className="flex flex-col items-center">
                <ul className="flex flex-col space-y-8 text-center text-xl">
                  {[
                    { name: '首页', path: '/' },
                    { name: '功能', action: () => handleNavigation('features') },
                    { name: '使用方法', action: () => handleNavigation('how-it-works') },
                    { name: '开始转换', path: '/convert' }
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.path ? (
                        <Link 
                          href={item.path} 
                          className="block py-2 px-4 text-white text-2xl font-medium hover:text-blue-200 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <button 
                          onClick={item.action} 
                          className="block py-2 px-4 text-white text-2xl font-medium hover:text-blue-200 transition-colors"
                        >
                          {item.name}
                        </button>
                      )}
                    </motion.li>
                  ))}
                </ul>
              </nav>
              
              <motion.div
                className="absolute bottom-10 left-0 right-0 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-white/70 text-sm">© 2024 File2Web</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
} 