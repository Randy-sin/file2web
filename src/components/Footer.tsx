import Link from 'next/link';
import { Globe } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <Image 
                src="/file2web.png" 
                alt="File2Web Logo" 
                width={64} 
                height={64} 
                className="h-12 w-auto"
              />
              <h3 className="text-xl font-semibold">File2Web</h3>
            </div>
            <p className="text-gray-400">
              一个简单易用的工具，帮助您将文字内容转换为精美的网页。
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  首页
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-gray-400 hover:text-white transition-colors">
                  功能
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">
                  使用方法
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">关注我们</h3>
            <div className="flex space-x-4">
              <a href="https://xxxxl-ai.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="个人网站">
                <Globe size={20} />
              </a>
              <a href="https://m.okjike.com/users/4208D501-FFCB-4A39-80DB-03831634CF74" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="即刻">
                <Image 
                  src="/jike.png" 
                  alt="即刻" 
                  width={20} 
                  height={20} 
                  className="w-5 h-5 object-contain filter grayscale opacity-80 hover:opacity-100 transition-all"
                />
              </a>
              <a href="https://www.xiaohongshu.com/user/profile/6421ad3f0000000012013587" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" title="小红书">
                <Image 
                  src="/rednote.png" 
                  alt="小红书" 
                  width={20} 
                  height={20} 
                  className="w-5 h-5 object-contain filter grayscale opacity-80 hover:opacity-100 transition-all"
                />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} File2Web. 保留所有权利。</p>
        </div>
      </div>
    </footer>
  );
} 