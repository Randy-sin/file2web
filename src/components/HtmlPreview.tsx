'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, Copy, Check, RefreshCw, FileText, Archive, Globe, Link, ArrowDown, ArrowUp } from 'lucide-react';
import JSZip from 'jszip';
import { motion } from 'framer-motion';

interface HtmlPreviewProps {
  html: string;
  isMultiFile?: boolean;
  files?: Array<{name: string, content: string}> | null;
}

/**
 * HtmlPreview组件 - 增强版
 * 
 * 提供HTML预览功能，支持单文件和多文件模式
 * 包含本地预览和网络发布功能
 */
export default function HtmlPreview({ html, isMultiFile = false, files = null }: HtmlPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<{name: string, content: string} | null>(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [codeExpanded, setCodeExpanded] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 清理HTML内容，移除代码块标记
  const cleanHtmlContent = (content: string): string => {
    // 移除```html和```标记
    let cleanedContent = content.replace(/```html\s*/g, '').replace(/\s*```/g, '');
    
    // 如果内容不是以<!DOCTYPE html>或<html开头，可能需要进一步处理
    if (!cleanedContent.trim().startsWith('<!DOCTYPE html>') && !cleanedContent.trim().startsWith('<html')) {
      // 尝试提取HTML部分
      const htmlMatch = content.match(/```html\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*(<!DOCTYPE html>[\s\S]*?)\s*```/);
      
      if (htmlMatch && htmlMatch[1]) {
        cleanedContent = htmlMatch[1].trim();
      }
    }
    
    return cleanedContent;
  };

  // 将CSS和JS内联到HTML中，用于预览
  const createPreviewHtml = (htmlFile: {name: string, content: string}, allFiles: Array<{name: string, content: string}>): string => {
    // 清理HTML内容
    let htmlContent = cleanHtmlContent(htmlFile.content);
    
    // 查找CSS文件
    const cssFile = allFiles.find(file => file.name === 'styles.css');
    // 查找JS文件
    const jsFile = allFiles.find(file => file.name === 'scripts.js');
    
    // 如果HTML中已经包含了完整的DOCTYPE和HTML标签
    if (htmlContent.includes('<!DOCTYPE html>') && htmlContent.includes('<html')) {
      // 在</head>标签前插入内联CSS
      if (cssFile) {
        const cssContent = cleanHtmlContent(cssFile.content);
        htmlContent = htmlContent.replace('</head>', `<style>${cssContent}</style></head>`);
      }
      
      // 在</body>标签前插入内联JS
      if (jsFile) {
        const jsContent = cleanHtmlContent(jsFile.content);
        htmlContent = htmlContent.replace('</body>', `<script>${jsContent}</script></body>`);
      }
    } else {
      // 如果HTML不完整，创建一个完整的HTML结构
      let fullHtml = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>预览</title>\n';
      
      // 添加内联CSS
      if (cssFile) {
        const cssContent = cleanHtmlContent(cssFile.content);
        fullHtml += `<style>${cssContent}</style>\n`;
      }
      
      fullHtml += '</head>\n<body>\n';
      
      // 添加HTML内容
      fullHtml += htmlContent;
      
      // 添加内联JS
      if (jsFile) {
        const jsContent = cleanHtmlContent(jsFile.content);
        fullHtml += `\n<script>${jsContent}</script>\n`;
      }
      
      fullHtml += '\n</body>\n</html>';
      htmlContent = fullHtml;
    }
    
    // 修复相对路径引用
    // 将href="otherfile.html"替换为正确的相对路径
    allFiles.forEach(file => {
      if (file.name !== htmlFile.name && file.name.endsWith('.html')) {
        const fileName = file.name;
        // 使用正则表达式匹配href属性，确保只替换HTML文件引用
        htmlContent = htmlContent.replace(
          new RegExp(`href=["']${fileName}["']`, 'g'), 
          `href="javascript:void(0);" data-file="${fileName}" class="internal-link"`
        );
      }
    });
    
    // 添加内部链接处理脚本
    const internalLinkScript = `
<script>
  // 处理内部链接
  document.addEventListener('DOMContentLoaded', function() {
    const internalLinks = document.querySelectorAll('.internal-link');
    internalLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const fileName = this.getAttribute('data-file');
        // 发送消息到父窗口，请求切换文件
        window.parent.postMessage({ type: 'switchFile', fileName: fileName }, '*');
      });
    });
  });
</script>`;
    
    // 在</body>标签前插入内部链接处理脚本
    if (htmlContent.includes('</body>')) {
      htmlContent = htmlContent.replace('</body>', `${internalLinkScript}</body>`);
    } else {
      htmlContent += internalLinkScript;
    }
    
    return htmlContent;
  };

  // 创建预览URL
  useEffect(() => {
    console.log('HtmlPreview组件收到HTML内容，长度:', html.length);
    console.log('多文件模式:', isMultiFile, '文件数量:', files?.length || 0);
    setIsLoading(true);
    
    // 创建一个Blob URL用于预览
    try {
      let contentToPreview;
      
      if (isMultiFile && files && files.length > 0) {
        // 多文件模式：将CSS和JS内联到HTML中
        const mainFile = files.find(file => file.name === 'index.html') || files[0];
        contentToPreview = createPreviewHtml(mainFile, files);
      } else {
        // 单文件模式：直接使用HTML内容
        contentToPreview = cleanHtmlContent(html);
      }
      
      if (contentToPreview && contentToPreview.trim() !== '') {
        const blob = new Blob([contentToPreview], { type: 'text/html' });
        const tempUrl = URL.createObjectURL(blob);
        setPreviewUrl(tempUrl);
        console.log('已创建Blob URL作为预览:', tempUrl);
        
        // 确保iframe的src属性被设置为临时URL
        setTimeout(() => {
          if (iframeRef.current && iframeRef.current.src !== tempUrl) {
            console.log('设置iframe src为Blob URL');
            iframeRef.current.src = tempUrl;
          }
        }, 0);
      }
    } catch (tempErr) {
      console.error('创建预览URL失败:', tempErr);
      setError('创建预览失败: ' + (tempErr instanceof Error ? tempErr.message : String(tempErr)));
    }
    
    // 如果是多文件模式，设置活动文件
    if (isMultiFile && files && files.length > 0) {
      const mainFile = files.find(file => file.name === 'index.html') || files[0];
      const mainFileIndex = files.findIndex(file => file.name === mainFile.name);
      setActiveFile(mainFile);
      setActiveFileIndex(mainFileIndex >= 0 ? mainFileIndex : 0);
    }
    
    setIsLoading(false);
  }, [html, isMultiFile, files]);

  // 当活动文件改变时更新预览
  useEffect(() => {
    if (activeFile && isMultiFile && files && files.length > 0) {
      console.log('活动文件已更改，更新预览:', activeFile.name);
      setIsLoading(true);
      
      try {
        // 确保内容不为空
        if (!activeFile.content || activeFile.content.trim() === '') {
          console.error('活动文件内容为空');
          setError('文件内容为空，无法显示');
          setIsLoading(false);
          return;
        }
        
        // 创建预览内容：将CSS和JS内联到HTML中
        const previewContent = createPreviewHtml(activeFile, files);
        
        // 创建新的Blob URL
        const blob = new Blob([previewContent], { type: 'text/html' });
        
        // 清理之前的URL
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }
        
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        
        // 更新iframe
        if (iframeRef.current) {
          iframeRef.current.src = url;
        }
        
        setIsLoading(false);
    } catch (err) {
        console.error('更新预览URL时出错:', err);
        setError('更新预览时出错: ' + (err instanceof Error ? err.message : String(err)));
        setIsLoading(false);
      }
    }
  }, [activeFile, isMultiFile, files]);

  // 添加消息监听器，处理iframe中的文件切换请求
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'switchFile' && event.data.fileName && files) {
        // 查找请求的文件
        const requestedFile = files.find(file => file.name === event.data.fileName);
        if (requestedFile) {
          // 找到文件索引
          const fileIndex = files.findIndex(file => file.name === event.data.fileName);
          // 切换到请求的文件
          handleFileSelect(requestedFile, fileIndex);
        }
      }
    };
    
    // 添加消息事件监听器
    window.addEventListener('message', handleMessage);
      
      // 清理函数
      return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [files]);

  // 复制代码
  const handleCopyCode = async () => {
    try {
      let contentToCopy = isMultiFile && activeFile ? activeFile.content : html;
      
      // 清理HTML内容
      contentToCopy = cleanHtmlContent(contentToCopy);
      
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
      setError('复制到剪贴板失败');
    }
  };

  // 下载当前文件
  const handleDownload = () => {
    try {
      if (isMultiFile && activeFile) {
        // 下载当前活动文件
        const cleanedContent = cleanHtmlContent(activeFile.content);
        const blob = new Blob([cleanedContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = activeFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // 下载单个HTML文件
        const cleanedContent = cleanHtmlContent(html);
        const blob = new Blob([cleanedContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated-webpage.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('下载失败:', err);
      setError('下载文件失败');
    }
  };

  // 下载所有文件为ZIP
  const handleDownloadAllFiles = async () => {
    if (!isMultiFile || !files || files.length === 0) return;
    
    try {
      // 使用JSZip创建一个ZIP文件
      const zip = new JSZip();
      
      // 添加所有文件到ZIP
      files.forEach(file => {
        zip.file(file.name, file.content);
      });
      
      // 生成ZIP文件并下载
      const content = await zip.generateAsync({type: 'blob'});
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated-website.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('创建ZIP文件失败:', err);
      
      // 如果JSZip不可用，则提供备选方案：逐个下载文件
      if (confirm('无法创建ZIP文件。是否要逐个下载所有文件？')) {
        files.forEach((file, index) => {
          setTimeout(() => {
            const blob = new Blob([file.content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, index * 500); // 每个文件下载间隔500ms，避免浏览器阻止多个下载
        });
      }
    }
  };

  // 刷新预览
  const refreshPreview = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      
      // 使用当前活动文件或HTML内容刷新预览
      let contentToPreview = isMultiFile && activeFile ? activeFile.content : html;
      
      // 清理HTML内容
      contentToPreview = cleanHtmlContent(contentToPreview);
      
          if (contentToPreview) {
            const blob = new Blob([contentToPreview], { type: 'text/html' });
            
        // 清理之前的URL
            if (previewUrl && previewUrl.startsWith('blob:')) {
              URL.revokeObjectURL(previewUrl);
            }
            
        const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            iframeRef.current.src = url;
        console.log('已刷新预览URL:', url);
          }

    setIsLoading(false);
    }
  };

  // 处理文件选择
  const handleFileSelect = (file: {name: string, content: string}, index: number) => {
    setActiveFile(file);
    setActiveFileIndex(index);
  };

  // 在新窗口中打开预览
  const openInNewTab = () => {
    try {
      let contentToPreview = isMultiFile && activeFile ? activeFile.content : html;
      
      // 清理HTML内容
      contentToPreview = cleanHtmlContent(contentToPreview);
      
      // 打开新窗口
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.open();
        previewWindow.document.write(contentToPreview);
        previewWindow.document.close();
      } else {
        alert('无法打开新窗口，请允许弹出窗口');
      }
    } catch (err) {
      console.error('在新窗口打开预览失败:', err);
      setError('在新窗口打开预览失败');
    }
  };

  // 发布网页到服务器
  const publishWebsite = async () => {
    if (publishedUrl) {
      // 如果已经发布过，直接打开URL
      window.open(publishedUrl, '_blank');
        return;
      }
      
    setIsPublishing(true);
    setError(null);
    
    try {
      // 准备要发布的内容
      let contentToPublish;
      let filesToPublish = null;
      
      if (isMultiFile && files && files.length > 0) {
        // 多文件模式
        filesToPublish = files.map(file => ({
          name: file.name,
          content: cleanHtmlContent(file.content)
        }));
        contentToPublish = filesToPublish[0].content;
        } else {
        // 单文件模式
        contentToPublish = cleanHtmlContent(html);
      }
      
      // 调用API发布网页
      const response = await fetch('/api/website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: contentToPublish,
          isMultiFile: isMultiFile,
          files: filesToPublish
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '发布失败');
      }
      
      // 保存发布的URL
      setPublishedUrl(data.url);
      
      // 打开发布的网页
      window.open(data.url, '_blank');
      
      } catch (err) {
      console.error('发布网页失败:', err);
      setError('发布失败: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsPublishing(false);
    }
  };

  // 复制发布的URL
  const copyPublishedUrl = async () => {
    if (!publishedUrl) return;
    
    try {
      await navigator.clipboard.writeText(publishedUrl);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch (err) {
      console.error('复制URL失败:', err);
      setError('复制URL失败');
    }
  };

  // 组件卸载时的清理
  useEffect(() => {
    return () => {
      // 清理所有Blob URL
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 简单的HTML语法高亮函数
  const highlightHtml = (code: string): string => {
    // 转义HTML特殊字符以防止XSS
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // 高亮HTML标签
    const highlightedTags = escaped.replace(
      /(&lt;[\/]?[a-zA-Z0-9\-]+(?:\s+[a-zA-Z0-9\-]+(?:=(?:&quot;.*?&quot;|&#039;.*?&#039;))?)*\s*[\/]?&gt;)/g,
      '<span class="text-blue-500 dark:text-blue-400">$1</span>'
    );

    // 高亮属性
    const highlightedAttrs = highlightedTags.replace(
      /(\s+[a-zA-Z0-9\-]+)=(&quot;.*?&quot;|&#039;.*?&#039;)/g,
      '<span class="text-amber-600 dark:text-amber-400">$1</span>=<span class="text-green-600 dark:text-green-400">$2</span>'
    );

    // 高亮注释
    const highlightedComments = highlightedAttrs.replace(
      /(&lt;!--[\s\S]*?--&gt;)/g,
      '<span class="text-gray-500 dark:text-gray-500">$1</span>'
    );

    // 高亮DOCTYPE
    const highlightedDoctype = highlightedComments.replace(
      /(&lt;!DOCTYPE[^&]*&gt;)/gi,
      '<span class="text-gray-500 dark:text-gray-400">$1</span>'
    );

    return highlightedDoctype;
  };

  // 切换代码展示区域的展开/折叠状态
  const toggleCodeExpanded = () => {
    setCodeExpanded(!codeExpanded);
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
      {/* 简化标题和操作区域 */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isMultiFile ? '生成的网站' : '生成的网页'}
        </h2>
        
        {/* 简化操作按钮组 */}
        <div className="flex flex-wrap gap-2">
          <motion.button
            onClick={handleCopyCode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center h-9 px-3 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 shadow-sm"
            title={copied ? '已复制' : '复制代码'}
          >
            {copied ? 
              <Check size={16} className="mr-1.5 text-green-500" /> : 
              <Copy size={16} className="mr-1.5" />
            }
            <span className="text-sm">复制代码</span>
          </motion.button>
          
          <motion.button
            onClick={handleDownload}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center h-9 px-3 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all border border-blue-100 dark:border-blue-800/50 shadow-sm"
            title={isMultiFile ? '下载当前文件' : '下载HTML文件'}
          >
            <Download size={16} className="mr-1.5" />
            <span className="text-sm">下载</span>
          </motion.button>
          
          <motion.button
            onClick={openInNewTab}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center h-9 px-3 rounded-md bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all border border-green-100 dark:border-green-800/50 shadow-sm"
            title="在新窗口打开"
          >
            <Globe size={16} className="mr-1.5" />
            <span className="text-sm">新窗口打开</span>
          </motion.button>
          
          <motion.button
            onClick={publishWebsite}
            disabled={isPublishing}
            whileHover={isPublishing ? {} : { scale: 1.05 }}
            whileTap={isPublishing ? {} : { scale: 0.95 }}
            className={`inline-flex items-center justify-center h-9 px-3 rounded-md ${
              publishedUrl 
                ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/30 border border-teal-100 dark:border-teal-800/50' 
                : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50'
            } transition-all shadow-sm ${isPublishing ? 'opacity-70 cursor-not-allowed' : ''}`}
            title={publishedUrl ? '打开已发布网页' : '发布到网络'}
          >
            {isPublishing ? 
              <div className="animate-spin mr-1.5 h-4 w-4 border-2 border-indigo-400 border-t-transparent rounded-full" /> : 
              <Globe size={16} className="mr-1.5" />
            }
            <span className="text-sm">
              {isPublishing ? '发布中...' : publishedUrl ? '打开网页' : '发布到网络'}
            </span>
          </motion.button>
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      
      {publishedUrl && (
        <div className="mx-4 mt-3 p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/30 text-teal-600 dark:text-teal-400 text-sm rounded-lg flex items-center justify-between">
          <span>网页已发布: <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="underline">{publishedUrl}</a></span>
          <motion.button
            onClick={copyPublishedUrl}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-2 py-1 bg-teal-100 dark:bg-teal-800/30 hover:bg-teal-200 dark:hover:bg-teal-700/30 rounded-md text-xs transition-colors"
          >
            {urlCopied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
            {urlCopied ? '已复制' : '复制网址'}
          </motion.button>
        </div>
      )}
      
      {/* 预览区域 - 简化设计 */}
      <div className="mx-4 mt-4 rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        {/* 浏览器风格顶栏 */}
        <div className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1.5 mr-3">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="mx-auto">
            <div className="bg-white dark:bg-gray-700 rounded-full h-6 px-3 inline-flex items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {isMultiFile && activeFile ? activeFile.name : 'index.html'}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full h-[400px] md:h-[500px] bg-white dark:bg-black relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400"></div>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">加载预览中...</p>
              </div>
            </div>
          )}
          {previewUrl ? (
            <iframe 
              ref={iframeRef}
              src={previewUrl} 
              className="w-full h-full border-none"
              title="网页预览"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                console.error('iframe加载失败');
                setError('预览加载失败，请尝试刷新');
                setIsLoading(false);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              {error ? '加载预览失败' : '加载预览中...'}
            </div>
          )}
        </div>
      </div>

      {/* 添加代码预览区域 */}
      <div className="mx-4 mt-5 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mr-2 text-xs font-mono">&lt;/&gt;</code>
            <span>HTML 代码</span>
          </h3>
          <motion.button
            onClick={toggleCodeExpanded}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center p-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label={codeExpanded ? "收起代码" : "展开代码"}
          >
            {codeExpanded ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          </motion.button>
        </div>
        
        <motion.div 
          className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto"
          animate={{ 
            height: codeExpanded ? 'auto' : '240px',
            maxHeight: codeExpanded ? 'none' : '240px'
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            {/* 代码行号 */}
            <div className="absolute top-0 left-0 bottom-0 w-10 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center pt-4 text-xs text-gray-400 dark:text-gray-500 font-mono select-none">
              {Array.from({ length: (isMultiFile && activeFile ? cleanHtmlContent(activeFile.content) : cleanHtmlContent(html)).split('\n').length }).map((_, i) => (
                <div key={i} className="h-6 leading-6">{i + 1}</div>
              ))}
            </div>
            
            {/* 代码内容 */}
            <pre className="p-4 pl-12 text-sm font-mono whitespace-pre overflow-x-auto">
              <div 
                className="text-gray-800 dark:text-gray-200" 
                dangerouslySetInnerHTML={{ 
                  __html: highlightHtml(isMultiFile && activeFile ? cleanHtmlContent(activeFile.content) : cleanHtmlContent(html))
                }} 
              />
            </pre>
          </div>
        </motion.div>
        
        {/* 代码统计信息 */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
          <div>
            {((isMultiFile && activeFile ? cleanHtmlContent(activeFile.content) : cleanHtmlContent(html)).match(/</g) || []).length} 标签 | 
            {((isMultiFile && activeFile ? cleanHtmlContent(activeFile.content) : cleanHtmlContent(html)).split('\n').length)} 行
          </div>
          <div className="italic">
            {codeExpanded ? '点击箭头收起代码' : '点击箭头查看完整代码'}
          </div>
        </div>
      </div>
    </div>
  );
} 