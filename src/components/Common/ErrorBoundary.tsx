/**
 * 错误边界组件
 * Chen Company Agent World - Error Boundary
 */

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });
    
    // 调用可选的错误回调
    this.props.onError?.(error, errorInfo);
    
    // 可以在这里添加日志上报
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // 如果有自定义 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误 UI
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">出现了一些问题</h2>
            <p className="error-message">
              {this.state.error?.message || '应用程序发生了未知错误'}
            </p>
            
            <div className="error-actions">
              <button 
                className="error-retry-btn"
                onClick={this.handleRetry}
              >
                🔄 重试
              </button>
              <button 
                className="error-reload-btn"
                onClick={() => window.location.reload()}
              >
                🔃 重新加载
              </button>
            </div>

            {this.state.errorInfo && (
              <details className="error-details">
                <summary>详细信息</summary>
                <pre>{this.state.error?.stack}</pre>
              </details>
            )}
          </div>

          <style>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
              min-height: 200px;
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
              color: white;
              padding: 40px;
            }

            .error-content {
              text-align: center;
              max-width: 400px;
            }

            .error-icon {
              font-size: 48px;
              margin-bottom: 16px;
            }

            .error-title {
              font-family: 'Press Start 2P', monospace;
              font-size: 16px;
              color: #EF4444;
              margin-bottom: 12px;
            }

            .error-message {
              font-family: 'VT323', monospace;
              font-size: 18px;
              color: #9CA3AF;
              margin-bottom: 24px;
              line-height: 1.5;
            }

            .error-actions {
              display: flex;
              gap: 12px;
              justify-content: center;
              margin-bottom: 20px;
            }

            .error-retry-btn,
            .error-reload-btn {
              padding: 10px 20px;
              font-family: 'VT323', monospace;
              font-size: 18px;
              border: 2px solid;
              border-radius: 4px;
              cursor: pointer;
              transition: all 0.2s;
            }

            .error-retry-btn {
              background: #3B82F6;
              border-color: #2563EB;
              color: white;
            }

            .error-retry-btn:hover {
              background: #2563EB;
            }

            .error-reload-btn {
              background: transparent;
              border-color: #6B7280;
              color: #9CA3AF;
            }

            .error-reload-btn:hover {
              border-color: #9CA3AF;
              color: white;
            }

            .error-details {
              margin-top: 20px;
              text-align: left;
              font-family: monospace;
              font-size: 12px;
              color: #6B7280;
              cursor: pointer;
            }

            .error-details pre {
              margin-top: 8px;
              padding: 12px;
              background: rgba(0, 0, 0, 0.3);
              border-radius: 4px;
              overflow-x: auto;
              max-height: 200px;
              overflow-y: auto;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
