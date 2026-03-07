/**
 * 房间类型定义
 * Simple flat map - no predefined rooms
 */

export type RoomId = string;

export interface Room {
  id: RoomId;
  name: string;
}

// 简单的空地图
export const DEFAULT_ROOMS: Room[] = [];

export function getRoomById(id: string): Room | undefined {
  return DEFAULT_ROOMS.find(room => room.id === id);
}

export function getAllRoomConfigs(): Room[] {
  return DEFAULT_ROOMS;
}

export function getAllRoomConfigsSync(): Room[] {
  return DEFAULT_ROOMS;
}
