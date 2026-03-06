/**
 * 右键菜单组件
 * Agent 右键弹出菜单
 */

import React, { useState, useEffect, useRef } from 'react';

interface MenuItem {
  label: string;
  icon?: string;
  onClick: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // 菜单位置调整（防止超出屏幕）
  const [position, setPosition] = useState({ x, y });
  
  useEffect(() => {
    const menuWidth = 180;
    const menuHeight = items.length * 40 + 20;
    const padding = 10;
    
    let newX = x;
    let newY = y;
    
    if (x + menuWidth > window.innerWidth - padding) {
      newX = window.innerWidth - menuWidth - padding;
    }
    if (y + menuHeight > window.innerHeight - padding) {
      newY = window.innerHeight - menuHeight - padding;
    }
    
    setPosition({ x: newX, y: newY });
  }, [x, y, items.length]);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        background: '#1E293B',
        border: '1px solid #475569',
        borderRadius: '8px',
        padding: '8px 0',
        minWidth: '180px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        zIndex: 1000,
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            cursor: 'pointer',
            color: item.danger ? '#EF4444' : '#E2E8F0',
            fontSize: '13px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#334155';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {item.icon && <span>{item.icon}</span>}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default ContextMenu;
