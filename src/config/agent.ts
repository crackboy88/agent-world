/**
 * Agent Appearance Configuration
 */

export interface AgentAppearance {
  id: string;
  name: string;
  // Colors
  skinColor: string;
  hairColor: string;
  clothesColor: string;
  accentColor: string;
  // Features
  accessory?: string; // Emoji
  // Sprite settings
  spriteSize?: number;
}

/**
 * Default agent appearances - empty, will use Gateway agent names
 * Users can configure appearances in agent.local.ts
 */
export const DEFAULT_AGENT_APPEARANCES: AgentAppearance[] = [];

/**
 * Available customization options
 */
export const APPEARANCE_OPTIONS = {
  skinColors: ['#FCD34D', '#E5B44D', '#D4A574', '#C68642', '#8D5524'],
  hairColors: ['#1F2937', '#374151', '#4B5563', '#6B7280', '#F5F5DC', '#8B4513', '#FF0000'],
  clothesColors: ['#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899', '#06B6D4'],
  accessories: ['💼', '👔', '👓', '🧢', '🎩', '🎒', '💍', '⌚', '🎧', '🧣'],
};
