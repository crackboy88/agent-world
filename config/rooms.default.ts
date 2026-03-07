/**
 * 房间配置 - 默认模板
 * Room Configuration - Default Template
 * 
 * 复制此文件为 rooms.local.ts 并修改为你的私有配置
 * Copy this file to rooms.local.ts and customize for your private config
 */

export type RoomId = string;

export interface RoomName {
  zh: string;
  en: string;
}

export interface RoomPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Furniture {
  id: string;
  name: string;
  nameZh: string;
  nameEn: string;
  type: 'desk' | 'chair' | 'cabinet' | 'plant' | 'other';
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface Window {
  position: { x: number; y: number };
  size: { width: number; height: number };
  hasOutsideView: boolean;
}

export interface Room {
  id: RoomId;
  name: RoomName;
  position: RoomPosition;
  furniture: Furniture[];
  windows: Window[];
  color: string;
  agentId?: string;
}

/**
 * 默认房间布局 - 简单的3x3网格
 * 可复制为 rooms.local.ts 自定义你的地图
 */
export const DEFAULT_ROOMS: Room[] = [
  {
    id: 'room-1',
    name: { zh: '房间 1', en: 'Room 1' },
    position: { x: 64, y: 64, width: 384, height: 384 },
    furniture: [
      { id: 'desk-1', name: 'Desk', nameZh: '办公桌', nameEn: 'Desk', type: 'desk', position: { x: 64, y: 64 }, size: { width: 96, height: 48 } },
    ],
    windows: [{ position: { x: 24, y: 24 }, size: { width: 64, height: 64 }, hasOutsideView: true }],
    color: '#EFF6FF',
  },
  {
    id: 'room-2',
    name: { zh: '房间 2', en: 'Room 2' },
    position: { x: 512, y: 64, width: 384, height: 384 },
    furniture: [
      { id: 'desk-1', name: 'Desk', nameZh: '办公桌', nameEn: 'Desk', type: 'desk', position: { x: 64, y: 64 }, size: { width: 96, height: 48 } },
    ],
    windows: [{ position: { x: 24, y: 24 }, size: { width: 64, height: 64 }, hasOutsideView: true }],
    color: '#FEF3C7',
  },
  {
    id: 'room-3',
    name: { zh: '房间 3', en: 'Room 3' },
    position: { x: 960, y: 64, width: 384, height: 384 },
    furniture: [
      { id: 'desk-1', name: 'Desk', nameZh: '办公桌', nameEn: 'Desk', type: 'desk', position: { x: 64, y: 64 }, size: { width: 96, height: 48 } },
    ],
    windows: [{ position: { x: 24, y: 24 }, size: { width: 64, height: 64 }, hasOutsideView: true }],
    color: '#DCFCE7',
  },
  {
    id: 'room-4',
    name: { zh: '房间 4', en: 'Room 4' },
    position: { x: 64, y: 512, width: 384, height: 384 },
    furniture: [],
    windows: [],
    color: '#F3E8FF',
  },
  {
    id: 'lobby',
    name: { zh: '大厅', en: 'Lobby' },
    position: { x: 512, y: 512, width: 832, height: 384 },
    furniture: [
      { id: 'sofa-1', name: 'Sofa', nameZh: '沙发', nameEn: 'Sofa', type: 'chair', position: { x: 128, y: 128 }, size: { width: 128, height: 56 } },
      { id: 'plant-1', name: 'Plant', nameZh: '绿植', nameEn: 'Plant', type: 'plant', position: { x: 64, y: 64 }, size: { width: 48, height: 48 } },
    ],
    windows: [],
    color: '#E0F2FE',
  },
  {
    id: 'room-5',
    name: { zh: '房间 5', en: 'Room 5' },
    position: { x: 1408, y: 512, width: 384, height: 384 },
    furniture: [],
    windows: [],
    color: '#FEE2E2',
  },
  {
    id: 'room-6',
    name: { zh: '房间 6', en: 'Room 6' },
    position: { x: 64, y: 960, width: 384, height: 384 },
    furniture: [],
    windows: [],
    color: '#FEF3C7',
  },
  {
    id: 'meeting',
    name: { zh: '会议室', en: 'Meeting Room' },
    position: { x: 512, y: 960, width: 384, height: 384 },
    furniture: [
      { id: 'table', name: 'Table', nameZh: '会议桌', nameEn: 'Table', type: 'desk', position: { x: 96, y: 128 }, size: { width: 192, height: 96 } },
    ],
    windows: [],
    color: '#F3E8FF',
  },
  {
    id: 'room-7',
    name: { zh: '房间 7', en: 'Room 7' },
    position: { x: 960, y: 960, width: 832, height: 384 },
    furniture: [],
    windows: [],
    color: '#DCFCE7',
  },
];

export function getRoomById(id: RoomId): Room | undefined {
  return DEFAULT_ROOMS.find(room => room.id === id);
}

export function getRoomDisplayName(room: Room, locale: 'zh' | 'en' = 'en'): string {
  return locale === 'zh' ? room.name.zh : room.name.en;
}
