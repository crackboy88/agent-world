/**
 * 右键快捷菜单组件
 * Chen Company Agent World - Context Menu
 */

import React, { useState, useEffect } from 'react';

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  divider?: boolean;
  action?: () => void;
  submenu?: MenuItem[];
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

/** 颜色常量 */
const COLORS = {
  primary: '#2563EB',
  border: '#E5E7EB',
  text: '#1F2937',
  textLight: '#6B7280',
  bg: '#FFFFFF',
  bgHover: '#EFF6FF',
  shadow: 'rgba(0, 0, 0, 0.15)',
};

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [position, setPosition] = useState({ x, y });

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  // 防止菜单超出屏幕
  useEffect(() => {
    const menuWidth = 200;
    const menuHeight = items.length * 36 + 16;
    const padding = 10;
    
    const maxX = window.innerWidth - menuWidth - padding;
    const maxY = window.innerHeight - menuHeight - padding;
    
    setPosition({
      x: Math.min(x, maxX),
      y: Math.min(y, maxY),
    });
  }, [x, y, items.length]);

  const handleItemClick = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (item.disabled) return;
    
    if (item.submenu) {
      setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
    } else if (item.action) {
      item.action();
      onClose();
    } else {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        minWidth: 180,
        background: COLORS.bg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        boxShadow: `0 4px 12px ${COLORS.shadow}`,
        padding: '6px 0',
        zIndex: 1000,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <React.Fragment key={item.id}>
          {item.divider ? (
            <div
              style={{
                height: 1,
                background: COLORS.border,
                margin: '6px 0',
              }}
            />
          ) : (
            <div
              onClick={(e) => handleItemClick(item, e)}
              onMouseEnter={() => item.submenu && setActiveSubmenu(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 16px',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                background: activeSubmenu === item.id ? COLORS.bgHover : 'transparent',
                opacity: item.disabled ? 0.5 : 1,
                transition: 'background 0.1s',
              }}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              {item.icon && (
                <span style={{ marginRight: 10, fontSize: 14 }}>{item.icon}</span>
              )}
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontFamily: 'var(--font-pixel)',
                  color: item.disabled ? COLORS.textLight : COLORS.text,
                }}
              >
                {item.label}
              </span>
              {item.submenu && (
                <span style={{ fontSize: 10, color: COLORS.textLight, marginLeft: 8 }}>
                  ▶
                </span>
              )}
              
              {/* 子菜单 */}
              {item.submenu && activeSubmenu === item.id && (
                <div
                  style={{
                    position: 'absolute',
                    left: '100%',
                    top: 0,
                    minWidth: 160,
                    background: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8,
                    boxShadow: `0 4px 12px ${COLORS.shadow}`,
                    padding: '6px 0',
                  }}
                >
                  {item.submenu.map((subItem) => (
                    <div
                      key={subItem.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!subItem.disabled && subItem.action) {
                          subItem.action();
                          onClose();
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 16px',
                        cursor: subItem.disabled ? 'not-allowed' : 'pointer',
                        opacity: subItem.disabled ? 0.5 : 1,
                      }}
                    >
                      {subItem.icon && (
                        <span style={{ marginRight: 10, fontSize: 14 }}>{subItem.icon}</span>
                      )}
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: 'var(--font-pixel)',
                          color: subItem.disabled ? COLORS.textLight : COLORS.text,
                        }}
                      >
                        {subItem.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ContextMenu;
