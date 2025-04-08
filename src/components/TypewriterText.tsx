'use client';

import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

/**
 * TypewriterText组件
 * 
 * 实现打字机效果，逐字显示文本
 */
export default function TypewriterText({
  text,
  delay = 0,
  speed = 20,
  onComplete,
  className = ''
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

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
        } else {
          setIsComplete(true);
          if (onComplete) {
            onComplete();
          }
        }
      }, speed);
    };
    
    const delayTimeout = setTimeout(() => {
      startTyping();
    }, delay);
    
    return () => {
      clearTimeout(timeout);
      clearTimeout(delayTimeout);
    };
  }, [text, delay, speed, onComplete]);

  return (
    <div className={`${className} relative`}>
      {displayText}
      {!isComplete && (
        <span className="inline-block w-2 h-4 bg-blue-500 dark:bg-blue-400 animate-pulse ml-1 align-middle"></span>
      )}
    </div>
  );
} 