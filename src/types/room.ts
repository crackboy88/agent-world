/**
 * 房间类型定义
 */

export type { Room, RoomName, RoomPosition, Furniture, Window, RoomId } from '../../config/rooms';
export { getRoomById, getRoomDisplayName, DEFAULT_ROOMS } from '../../config/rooms';

import { DEFAULT_ROOMS } from '../../config/rooms';

export const ROOMS_CONFIG = DEFAULT_ROOMS;

export function getRoomByIdLegacy(id: string) {
  return ROOMS_CONFIG.find(room => room.id === id);
}
