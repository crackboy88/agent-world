/**
 * 键盘快捷键覆盖层
 * Chen Company Agent World - Keyboard Shortcuts
 */

import React, { useState } from 'react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: '1-6', desc: '选择 Agent 1-6', descEn: 'Select Agent 1-6' },
  { key: 'Space', desc: '选择/取消选择房间', descEn: 'Select/Deselect Room' },
  { key: 'T', desc: '打开自定义任务对话框', descEn: 'Open Custom Task Dialog' },
  { key: 'R', desc: '重置地图视图', descEn: 'Reset Map View' },
  { key: '+/-', desc: '放大/缩小地图', descEn: 'Zoom In/Out' },
  { key: 'Arrow Keys', desc: '移动地图视图', descEn: 'Pan Map View' },
  { key: 'Esc', desc: '关闭对话框/取消选择', descEn: 'Close Dialog/Deselect' },
  { key: '?', desc: '显示/隐藏快捷键帮助', descEn: 'Toggle Help' },
];

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
  const [locale] = useState<'zh' | 'en'>('zh');

  if (!isOpen) return null;

  return (
    <div className="keyboard-help-overlay" onClick={onClose}>
      <div className="keyboard-help-dialog" onClick={e => e.stopPropagation()}>
        <div className="keyboard-help-header">
          <h3>⌨️ {locale === 'zh' ? '键盘快捷键' : 'Keyboard Shortcuts'}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="keyboard-help-content">
          <table className="shortcuts-table">
            <thead>
              <tr>
                <th>{locale === 'zh' ? '按键' : 'Key'}</th>
                <th>{locale === 'zh' ? '功能' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {shortcuts.map((s, i) => (
                <tr key={i}>
                  <td><kbd>{s.key}</kbd></td>
                  <td>{locale === 'zh' ? s.desc : s.descEn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="keyboard-help-footer">
          <p>{locale === 'zh' ? '按 Esc 关闭' : 'Press Esc to close'}</p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
