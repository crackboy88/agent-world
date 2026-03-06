/**
 * 像素风加载动画组件
 * Chen Company Agent World - Pixel Loading Screen
 */

import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  onComplete?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading, onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      // 进度模拟
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => onComplete?.(), 500);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isLoading, onComplete]);

  if (!isLoading && progress === 0) return null;

  return (
    <div className="loading-screen">
      <div className="loading-content">
        {/* 像素风 Logo */}
        <div className="loading-logo">
          <div className="pixel-building">
            {/* 楼体 */}
            <div className="building-main">
              <div className="building-floor f1"></div>
              <div className="building-floor f2"></div>
              <div className="building-floor f3"></div>
              <div className="building-floor f4"></div>
            </div>
            <div className="building-left">
              <div className="building-floor f1"></div>
              <div className="building-floor f2"></div>
              <div className="building-floor f3"></div>
            </div>
            <div className="building-right">
              <div className="building-floor f1"></div>
              <div className="building-floor f2"></div>
              <div className="building-floor f3"></div>
            </div>
            {/* 屋顶 */}
            <div className="building-roof"></div>
          </div>
        </div>

        {/* 标题 */}
        <h1 className="loading-title">
          CHEN COMPANY
        </h1>
        <p className="loading-subtitle">
          Agent World{Array(3).fill('').map((_, i) => <span key={i}>.</span>)}
        </p>

        {/* 进度条 */}
        <div className="loading-progress-container">
          <div className="loading-progress-bar">
            <div 
              className="loading-progress-fill" 
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <span className="loading-progress-text">
            {Math.min(Math.round(progress), 100)}%
          </span>
        </div>

        {/* 状态文字 */}
        <p className="loading-status">
          {progress < 30 && '初始化系统...'}
          {progress >= 30 && progress < 60 && '加载资源...'}
          {progress >= 60 && progress < 90 && '构建场景...'}
          {progress >= 90 && '准备就绪!'}
        </p>

        {/* 装饰像素 */}
        <div className="loading-decor">
          <span className="pixel-star">★</span>
          <span className="pixel-star">☆</span>
          <span className="pixel-star">★</span>
        </div>
      </div>

      <style>{`
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .loading-content {
          text-align: center;
          color: white;
        }

        .loading-logo {
          margin-bottom: 30px;
        }

        .pixel-building {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 4px;
          height: 80px;
        }

        .building-main {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .building-left, .building-right {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .building-floor {
          width: 40px;
          height: 16px;
          background: #D4AF37;
          border: 2px solid #B8962E;
        }

        .building-floor.f1 { background: #C41E3A; border-color: #9A1830; }
        .building-floor.f2 { background: #D4AF37; border-color: #B8962E; }
        .building-floor.f3 { background: #2563EB; border-color: #1D4ED8; }
        .building-floor.f4 { background: #10B981; border-color: #059669; }

        .building-left .building-floor {
          width: 24px;
          height: 12px;
        }

        .building-right .building-floor {
          width: 28px;
          height: 14px;
        }

        .building-roof {
          width: 48px;
          height: 8px;
          background: #C41E3A;
          border: 2px solid #9A1830;
          margin: 0 auto;
        }

        .loading-title {
          font-family: 'Press Start 2P', monospace;
          font-size: 24px;
          color: #D4AF37;
          margin-bottom: 8px;
          text-shadow: 2px 2px 0 #C41E3A;
        }

        .loading-subtitle {
          font-family: 'VT323', monospace;
          font-size: 20px;
          color: #9CA3AF;
          margin-bottom: 30px;
        }

        .loading-subtitle span {
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .loading-progress-container {
          display: flex;
          align-items: center;
          gap: 16px;
          justify-content: center;
          margin-bottom: 20px;
        }

        .loading-progress-bar {
          width: 200px;
          height: 16px;
          background: #374151;
          border: 2px solid #4B5563;
          border-radius: 0;
          overflow: hidden;
        }

        .loading-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #C41E3A, #D4AF37);
          transition: width 0.3s ease;
        }

        .loading-progress-text {
          font-family: 'VT323', monospace;
          font-size: 18px;
          color: #D4AF37;
          min-width: 45px;
        }

        .loading-status {
          font-family: 'VT323', monospace;
          font-size: 16px;
          color: #6B7280;
        }

        .loading-decor {
          margin-top: 30px;
          display: flex;
          gap: 20px;
          justify-content: center;
        }

        .pixel-star {
          font-size: 20px;
          animation: twinkle 2s infinite;
        }

        .pixel-star:nth-child(2) {
          animation-delay: 0.5s;
        }

        .pixel-star:nth-child(3) {
          animation-delay: 1s;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
