'use client';

import { useState, useEffect } from 'react';
import AdModal from './AdModal';
import AdBanner from './AdBanner';

// 广告展示间隔（毫秒）- 默认为 24 小时
const AD_INTERVAL = 24 * 60 * 60 * 1000;
// 会话内最大广告展示次数
const MAX_ADS_PER_SESSION = 2;
// 用户操作次数阈值，超过此值才会考虑展示广告
const USER_ACTIONS_THRESHOLD = 3;

interface AdManagerProps {
  // 可选：强制显示特定类型的广告
  forceShow?: 'modal' | 'banner' | null;
}

export default function AdManager({ forceShow = null }: AdManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [userActions, setUserActions] = useState(0);
  const [sessionAdCount, setSessionAdCount] = useState(0);

  // 初始化广告管理器
  useEffect(() => {
    // 从 localStorage 读取上次广告展示时间
    const lastAdTime = localStorage.getItem('lastAdTime');
    const lastAdType = localStorage.getItem('lastAdType');
    const sessionCount = sessionStorage.getItem('adSessionCount');
    
    // 更新会话广告计数
    if (sessionCount) {
      setSessionAdCount(parseInt(sessionCount, 10));
    } else {
      sessionStorage.setItem('adSessionCount', '0');
    }

    // 监听用户操作
    const trackUserAction = () => {
      setUserActions(prev => prev + 1);
    };

    // 监听用户交互事件
    window.addEventListener('click', trackUserAction);
    window.addEventListener('scroll', trackUserAction);
    
    // 如果强制显示特定类型的广告
    if (forceShow) {
      if (forceShow === 'modal') {
        setTimeout(() => setIsModalOpen(true), 1000);
      } else if (forceShow === 'banner') {
        setTimeout(() => setShowBanner(true), 1000);
      }
      return;
    }

    // 决定是否显示广告
    const shouldShowAd = () => {
      // 如果会话内广告已达上限，不再显示
      if (sessionAdCount >= MAX_ADS_PER_SESSION) {
        return false;
      }
      
      // 如果没有上次展示记录，或者已经超过间隔时间
      if (!lastAdTime || Date.now() - parseInt(lastAdTime, 10) > AD_INTERVAL) {
        return true;
      }
      
      return false;
    };

    // 延迟检查是否应该显示广告
    const timer = setTimeout(() => {
      if (shouldShowAd()) {
        // 根据上次展示的广告类型，交替显示不同类型
        if (lastAdType === 'modal' || !lastAdType) {
          setShowBanner(true);
          localStorage.setItem('lastAdType', 'banner');
        } else {
          setIsModalOpen(true);
          localStorage.setItem('lastAdType', 'modal');
        }
        
        // 更新广告展示时间和会话计数
        localStorage.setItem('lastAdTime', Date.now().toString());
        const newCount = sessionAdCount + 1;
        setSessionAdCount(newCount);
        sessionStorage.setItem('adSessionCount', newCount.toString());
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', trackUserAction);
      window.removeEventListener('scroll', trackUserAction);
    };
  }, [forceShow, sessionAdCount]);

  // 监听用户操作次数，当超过阈值且没有显示广告时，考虑显示横幅广告
  useEffect(() => {
    if (userActions > USER_ACTIONS_THRESHOLD && !isModalOpen && !showBanner && sessionAdCount < MAX_ADS_PER_SESSION) {
      const lastAdTime = localStorage.getItem('lastAdTime');
      
      // 如果没有最近的广告展示，或者已经过了一定时间
      if (!lastAdTime || Date.now() - parseInt(lastAdTime, 10) > AD_INTERVAL / 4) {
        setShowBanner(true);
        localStorage.setItem('lastAdType', 'banner');
        localStorage.setItem('lastAdTime', Date.now().toString());
        
        const newCount = sessionAdCount + 1;
        setSessionAdCount(newCount);
        sessionStorage.setItem('adSessionCount', newCount.toString());
      }
    }
  }, [userActions, isModalOpen, showBanner, sessionAdCount]);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleBannerClose = () => {
    setShowBanner(false);
  };

  return (
    <>
      <AdModal isOpen={isModalOpen} onClose={handleModalClose} />
      {showBanner && <AdBanner onClose={handleBannerClose} />}
    </>
  );
} 