/**
 * 右键菜单组件
 * Chen Company Agent World - Context Menu
 */

import React, { useState, useEffect } from 'react';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  divider?: boolean;
  action?: () => void;
  submenu?: ContextMenuItem[];
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  
  // 点击外部关闭菜单
  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  // 防止右键菜单区域点击关闭
  const handleContextMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleItemClick = (item: ContextMenuItem) => {
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

  // 计算菜单位置（避免超出屏幕）
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth - 200),
    top: Math.min(y, window.innerHeight - 300),
    zIndex: 1000
  };

  return (
    <div 
      className="context-menu"
      style={menuStyle}
      onContextMenu={handleContextMenu}
    >
      {items.map((item) => (
        <React.Fragment key={item.id}>
          {item.divider ? (
            <div className="context-menu-divider" />
          ) : (
            <div 
              className={`context-menu-item ${item.disabled ? 'disabled' : ''} ${activeSubmenu === item.id ? 'active' : ''}`}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => item.submenu && setActiveSubmenu(item.id)}
            >
              {item.icon && <span className="menu-icon">{item.icon}</span>}
              <span className="menu-label">{item.label}</span>
              {item.submenu && <span className="menu-arrow">▶</span>}
              
              {/* 子菜单 */}
              {item.submenu && activeSubmenu === item.id && (
                <div className="context-submenu">
                  {item.submenu.map((subItem) => (
                    <div
                      key={subItem.id}
                      className={`context-menu-item ${subItem.disabled ? 'disabled' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!subItem.disabled && subItem.action) {
                          subItem.action();
                          onClose();
                        }
                      }}
                    >
                      {subItem.icon && <span className="menu-icon">{subItem.icon}</span>}
                      <span className="menu-label">{subItem.label}</span>
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
