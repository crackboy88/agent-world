/**
 * 房间类型定义
 * Room Types - Generic version
 */

import type { RoomId } from './room';

// Re-export types
export type { Room, RoomName, RoomPosition, Furniture, Window, RoomId } from '../../config/rooms.default';
export { getRoomById, getRoomDisplayName } from '../../config/rooms.default';

// For backward compatibility - load from config
import { getAllRoomConfigs } from '../../config';

export const ROOMS_CONFIG = getAllRoomConfigs();

export function getRoomByIdLegacy(id: string) {
  return ROOMS_CONFIG.find(room => room.id === id);
}
