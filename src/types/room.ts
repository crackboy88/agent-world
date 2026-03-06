/**
 * 房间类型定义
 * Chen Company Agent World - Room Types
 */

// 房间ID类型
export type RoomId = 
  | 'ceo-office'      // CEO办公室
  | 'finance'        // 财务部
  | 'meeting-room'   // 会议室
  | 'tech'           // 技术部
  | 'rnd'            // 研发部
  | 'lobby'          // 公共大厅
  | 'strategy'       // 战略部
  | 'entrance'       // 入口大厅
  | 'operations';    // 运营部

// 房间名称（支持中英文）
export interface RoomName {
  zh: string;
  en: string;
}

// 位置与尺寸（8px整数倍）
export interface RoomPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 家具项
export interface Furniture {
  id: string;
  name: string;
  nameZh: string;
  nameEn: string;
  type: 'desk' | 'chair' | 'cabinet' | 'plant' | 'other';
  position: { x: number; y: number };
  size: { width: number; height: number };
}

// 窗户信息
export interface Window {
  position: { x: number; y: number };
  size: { width: number; height: number };
  hasOutsideView: boolean;
}

// 房间接口
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
 * 标准回字形9房间布局配置
 * 地图总尺寸：2048px × 1536px
 * 所有坐标、尺寸严格8px整数倍
 */
export const ROOMS_CONFIG: Room[] = [
  // ===== 外圈顶部 =====
  {
    id: 'finance',
    name: { zh: '财务部', en: 'Finance' },
    position: { x: 64, y: 64, width: 320, height: 192 },
    furniture: [
      { id: 'safe', name: '保险柜', nameZh: '保险柜', nameEn: 'Safe', type: 'cabinet', position: { x: 24, y: 128 }, size: { width: 64, height: 48 } },
      { id: 'desk-1', name: '办公工位', nameZh: '办公工位', nameEn: 'Desk', type: 'desk', position: { x: 120, y: 120 }, size: { width: 96, height: 48 } },
      { id: 'cabinet', name: '文件柜', nameZh: '文件柜', nameEn: 'File Cabinet', type: 'cabinet', position: { x: 240, y: 32 }, size: { width: 48, height: 128 } }
    ],
    windows: [{ position: { x: 24, y: 24 }, size: { width: 96, height: 64 }, hasOutsideView: true }],
    color: '#EFF6FF',
    agentId: 'financial-analyst'
  },
  {
    id: 'tech',
    name: { zh: '技术部', en: 'Technology' },
    position: { x: 448, y: 64, width: 256, height: 192 },
    furniture: [
      { id: 'server', name: '服务器机架', nameZh: '服务器机架', nameEn: 'Server Rack', type: 'cabinet', position: { x: 16, y: 128 }, size: { width: 48, height: 48 } },
      { id: 'desk-1', name: '开发工位', nameZh: '开发工位', nameEn: 'Dev Desk', type: 'desk', position: { x: 80, y: 120 }, size: { width: 96, height: 48 } },
      { id: 'desk-2', name: '开发工位', nameZh: '开发工位', nameEn: 'Dev Desk', type: 'desk', position: { x: 80, y: 24 }, size: { width: 96, height: 48 } },
      { id: 'whiteboard', name: '白板', nameZh: '白板', nameEn: 'Whiteboard', type: 'other', position: { x: 192, y: 16 }, size: { width: 48, height: 80 } }
    ],
    windows: [{ position: { x: 24, y: 24 }, size: { width: 64, height: 64 }, hasOutsideView: true }],
    color: '#EFF6FF',
    agentId: 'code-expert'
  },
  {
    id: 'rnd',
    name: { zh: '研发部', en: 'R&D' },
    position: { x: 768, y: 64, width: 256, height: 192 },
    furniture: [
      { id: 'lab-bench', name: '实验台', nameZh: '实验台', nameEn: 'Lab Bench', type: 'desk', position: { x: 16, y: 128 }, size: { width: 96, height: 48 } },
      { id: 'desk-1', name: '研发工位', nameZh: '研发工位', nameEn: 'R&D Desk', type: 'desk', position: { x: 128, y: 120 }, size: { width: 96, height: 48 } },
      { id: 'whiteboard', name: '白板', nameZh: '白板', nameEn: 'Whiteboard', type: 'other', position: { x: 192, y: 16 }, size: { width: 48, height: 80 } }
    ],
    windows: [{ position: { x: 24, y: 24 }, size: { width: 64, height: 64 }, hasOutsideView: true }],
    color: '#EFF6FF',
    agentId: 'materials-scientist'
  },
  {
    id: 'strategy',
    name: { zh: '战略部', en: 'Strategy' },
    position: { x: 1088, y: 64, width: 320, height: 192 },
    furniture: [
      { id: 'desk-1', name: '战略工位', nameZh: '战略工位', nameEn: 'Strategy Desk', type: 'desk', position: { x: 24, y: 120 }, size: { width: 96, height: 48 } },
      { id: 'projector', name: '投影仪', nameZh: '投影仪', nameEn: 'Projector', type: 'other', position: { x: 24, y: 24 }, size: { width: 64, height: 48 } },
      { id: 'cabinet', name: '文件柜', nameZh: '文件柜', nameEn: 'File Cabinet', type: 'cabinet', position: { x: 256, y: 32 }, size: { width: 48, height: 128 } },
      { id: 'globe', name: '地球仪', nameZh: '地球仪', nameEn: 'Globe', type: 'other', position: { x: 176, y: 144 }, size: { width: 40, height: 40 } }
    ],
    windows: [{ position: { x: 200, y: 24 }, size: { width: 96, height: 64 }, hasOutsideView: true }],
    color: '#EFF6FF',
    agentId: 'political-analyst'
  },
  {
    id: 'ceo-office',
    name: { zh: 'CEO办公室', en: 'CEO Office' },
    position: { x: 1472, y: 64, width: 512, height: 192 },
    furniture: [
      { id: 'exec-desk', name: '大班台', nameZh: '大班台', nameEn: 'Executive Desk', type: 'desk', position: { x: 320, y: 96 }, size: { width: 160, height: 80 } },
      { id: 'exec-chair', name: '老板椅', nameZh: '老板椅', nameEn: 'Executive Chair', type: 'chair', position: { x: 360, y: 176 }, size: { width: 48, height: 8 } },
      { id: 'sofa', name: '沙发', nameZh: '沙发', nameEn: 'Sofa', type: 'chair', position: { x: 48, y: 128 }, size: { width: 96, height: 48 } },
      { id: 'coffee-table', name: '茶几', nameZh: '茶几', nameEn: 'Coffee Table', type: 'other', position: { x: 72, y: 176 }, size: { width: 48, height: 8 } },
      { id: 'bookshelf', name: '书架', nameZh: '书架', nameEn: 'Bookshelf', type: 'cabinet', position: { x: 24, y: 24 }, size: { width: 72, height: 160 } }
    ],
    windows: [
      { position: { x: 192, y: 24 }, size: { width: 96, height: 64 }, hasOutsideView: true },
      { position: { x: 352, y: 24 }, size: { width: 96, height: 64 }, hasOutsideView: true }
    ],
    color: '#EFF6FF',
    agentId: 'main'
  },
  
  // ===== 外圈左侧 =====
  {
    id: 'operations',
    name: { zh: '运营部', en: 'Operations' },
    position: { x: 64, y: 320, width: 320, height: 896 },
    furniture: [
      { id: 'desk-1', name: '工位', nameZh: '工位', nameEn: 'Desk', type: 'desk', position: { x: 24, y: 64 }, size: { width: 96, height: 48 } },
      { id: 'desk-2', name: '工位', nameZh: '工位', nameEn: 'Desk', type: 'desk', position: { x: 24, y: 176 }, size: { width: 96, height: 48 } },
      { id: 'desk-3', name: '工位', nameZh: '工位', nameEn: 'Desk', type: 'desk', position: { x: 24, y: 288 }, size: { width: 96, height: 48 } },
      { id: 'desk-4', name: '工位', nameZh: '工位', nameEn: 'Desk', type: 'desk', position: { x: 24, y: 400 }, size: { width: 96, height: 48 } },
      { id: 'cabinet', name: '文件柜', nameZh: '文件柜', nameEn: 'File Cabinet', type: 'cabinet', position: { x: 256, y: 64 }, size: { width: 48, height: 128 } },
      { id: 'whiteboard', name: '白板', nameZh: '白板', nameEn: 'Whiteboard', type: 'other', position: { x: 256, y: 256 }, size: { width: 48, height: 80 } }
    ],
    windows: [],
    color: '#EFF6FF',
    agentId: 'zhihu'
  },
  
  // ===== 正中间 - 公共大厅 =====
  {
    id: 'lobby',
    name: { zh: '公共大厅', en: 'Lobby' },
    position: { x: 448, y: 320, width: 1152, height: 896 },
    furniture: [
      { id: 'sofa-1', name: '休息沙发', nameZh: '休息沙发', nameEn: 'Lounge Sofa', type: 'chair', position: { x: 256, y: 128 }, size: { width: 128, height: 56 } },
      { id: 'sofa-2', name: '休息沙发', nameZh: '休息沙发', nameEn: 'Lounge Sofa', type: 'chair', position: { x: 256, y: 256 }, size: { width: 128, height: 56 } },
      { id: 'plant-1', name: '大型绿植', nameZh: '大型绿植', nameEn: 'Large Plant', type: 'plant', position: { x: 64, y: 64 }, size: { width: 64, height: 64 } },
      { id: 'plant-2', name: '大型绿植', nameZh: '大型绿植', nameEn: 'Large Plant', type: 'plant', position: { x: 64, y: 256 }, size: { width: 64, height: 64 } },
      { id: 'plant-3', name: '大型绿植', nameZh: '大型绿植', nameEn: 'Large Plant', type: 'plant', position: { x: 1024, y: 64 }, size: { width: 64, height: 64 } },
      { id: 'plant-4', name: '大型绿植', nameZh: '大型绿植', nameEn: 'Large Plant', type: 'plant', position: { x: 1024, y: 256 }, size: { width: 64, height: 64 } },
      { id: 'notice-board', name: '公告栏', nameZh: '公告栏', nameEn: 'Notice Board', type: 'other', position: { x: 512, y: 64 }, size: { width: 128, height: 80 } },
      { id: 'reception-desk', name: '接待台', nameZh: '接待台', nameEn: 'Reception Desk', type: 'desk', position: { x: 512, y: 768 }, size: { width: 128, height: 56 } }
    ],
    windows: [],
    color: '#EFF6FF'
  },
  
  // ===== 外圈右侧 =====
  {
    id: 'meeting-room',
    name: { zh: '会议室', en: 'Meeting Room' },
    position: { x: 1664, y: 320, width: 320, height: 896 },
    furniture: [
      { id: 'table', name: '大型会议桌', nameZh: '大型会议桌', nameEn: 'Conference Table', type: 'desk', position: { x: 64, y: 384 }, size: { width: 192, height: 128 } },
      { id: 'chair-1', name: '会议椅', nameZh: '会议椅', nameEn: 'Chair', type: 'chair', position: { x: 80, y: 296 }, size: { width: 32, height: 32 } },
      { id: 'chair-2', name: '会议椅', nameZh: '会议椅', nameEn: 'Chair', type: 'chair', position: { x: 144, y: 296 }, size: { width: 32, height: 32 } },
      { id: 'chair-3', name: '会议椅', nameZh: '会议椅', nameEn: 'Chair', type: 'chair', position: { x: 208, y: 296 }, size: { width: 32, height: 32 } },
      { id: 'chair-4', name: '会议椅', nameZh: '会议椅', nameEn: 'Chair', type: 'chair', position: { x: 80, y: 528 }, size: { width: 32, height: 32 } },
      { id: 'chair-5', name: '会议椅', nameZh: '会议椅', nameEn: 'Chair', type: 'chair', position: { x: 144, y: 528 }, size: { width: 32, height: 32 } },
      { id: 'chair-6', name: '会议椅', nameZh: '会议椅', nameEn: 'Chair', type: 'chair', position: { x: 208, y: 528 }, size: { width: 32, height: 32 } },
      { id: 'projector', name: '投影幕布', nameZh: '投影幕布', nameEn: 'Projector Screen', type: 'other', position: { x: 96, y: 64 }, size: { width: 128, height: 80 } }
    ],
    windows: [],
    color: '#EFF6FF'
  },
  
  // ===== 底部入口区 =====
  {
    id: 'entrance',
    name: { zh: '入口大厅', en: 'Entrance' },
    position: { x: 64, y: 1280, width: 1920, height: 192 },
    furniture: [
      { id: 'reception', name: '前台接待台', nameZh: '前台接待台', nameEn: 'Reception', type: 'desk', position: { x: 864, y: 112 }, size: { width: 192, height: 56 } },
      { id: 'logo-wall', name: '公司logo墙', nameZh: '公司logo墙', nameEn: 'Logo Wall', type: 'other', position: { x: 64, y: 32 }, size: { width: 160, height: 80 } },
      { id: 'sofa-1', name: '等候沙发', nameZh: '等候沙发', nameEn: 'Waiting Sofa', type: 'chair', position: { x: 320, y: 128 }, size: { width: 96, height: 48 } },
      { id: 'sofa-2', name: '等候沙发', nameZh: '等候沙发', nameEn: 'Waiting Sofa', type: 'chair', position: { x: 1504, y: 128 }, size: { width: 96, height: 48 } },
      { id: 'plant-1', name: '绿植', nameZh: '绿植', nameEn: 'Plant', type: 'plant', position: { x: 240, y: 128 }, size: { width: 48, height: 48 } },
      { id: 'plant-2', name: '绿植', nameZh: '绿植', nameEn: 'Plant', type: 'plant', position: { x: 1760, y: 128 }, size: { width: 48, height: 48 } }
    ],
    windows: [],
    color: '#EFF6FF'
  }
];

// 根据ID获取房间
export function getRoomById(id: RoomId): Room | undefined {
  return ROOMS_CONFIG.find(room => room.id === id);
}

// 获取房间显示名称
export function getRoomDisplayName(room: Room, locale: 'zh' | 'en' = 'zh'): string {
  return locale === 'zh' ? room.name.zh : room.name.en;
}
