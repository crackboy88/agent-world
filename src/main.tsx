import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './i18n'

// 抑制 Three.js 废弃警告
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const msg = args[0];
  if (typeof msg === 'string' && (msg.includes('deprecated') || msg.includes('THREE.'))) {
    return;
  }
  originalWarn(...args);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
