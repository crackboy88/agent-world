/**
 * Agent 动画 Hook
 * 提供平滑的位置过渡动画
 */

import { useEffect, useRef, useState } from 'react';
import type { Position } from '../types/agent';

interface UseAgentAnimationOptions {
  position: Position;
  targetPosition?: Position;
  speed?: number; // 移动速度
  enabled?: boolean;
}

interface AnimatedPosition extends Position {
  isMoving: boolean;
}

/**
 * Agent 位置动画 Hook
 * 使用线性插值实现平滑移动
 */
export function useAgentAnimation({
  position,
  targetPosition,
  speed = 0.05, // 每帧移动 5% 的距离
  enabled = true
}: UseAgentAnimationOptions): AnimatedPosition {
  const [animatedPos, setAnimatedPos] = useState<AnimatedPosition>({
    x: position.x,
    y: position.y,
    isMoving: false
  });
  
  const animationRef = useRef<number | null>(null);
  const targetRef = useRef<Position | undefined>(targetPosition);
  
  // 更新目标位置
  useEffect(() => {
    if (targetPosition && enabled) {
      targetRef.current = targetPosition;
    }
  }, [targetPosition, enabled]);
  
  // 动画循环
  useEffect(() => {
    if (!enabled) return;
    
    const animate = () => {
      const currentTarget = targetRef.current;
      
      if (currentTarget) {
        const dx = currentTarget.x - animatedPos.x;
        const dy = currentTarget.y - animatedPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 如果距离大于阈值，继续移动
        if (distance > 1) {
          // 使用缓动函数（ ease-out）
          const newX = animatedPos.x + dx * speed;
          const newY = animatedPos.y + dy * speed;
          
          setAnimatedPos({
            x: newX,
            y: newY,
            isMoving: true
          });
          
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // 到达目标
          setAnimatedPos({
            x: currentTarget.x,
            y: currentTarget.y,
            isMoving: false
          });
          targetRef.current = undefined;
        }
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animatedPos.x, animatedPos.y, enabled]);
  
  // 当位置更新时（外部强制更新），重置动画位置
  useEffect(() => {
    if (!targetRef.current) {
      setAnimatedPos({
        x: position.x,
        y: position.y,
        isMoving: false
      });
    }
  }, [position.x, position.y]);
  
  return animatedPos;
}

/**
 * 脉冲动画 Hook
 * 用于创建呼吸/闪烁效果
 */
export function usePulseAnimation(baseScale: number = 1, enabled: boolean = true) {
  const [scale, setScale] = useState(baseScale);
  
  useEffect(() => {
    if (!enabled) {
      setScale(baseScale);
      return;
    }
    
    let time = 0;
    const animate = () => {
      time += 0.05;
      const pulse = Math.sin(time) * 0.03; // ±3% 波动
      setScale(baseScale + pulse);
      requestAnimationFrame(animate);
    };
    
    const rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [baseScale, enabled]);
  
  return scale;
}

/**
 * 淡入淡出动画 Hook
 */
export function useFadeAnimation(visible: boolean, duration: number = 300) {
  const [opacity, setOpacity] = useState(visible ? 1 : 0);
  
  useEffect(() => {
    if (visible) {
      setOpacity(1);
    } else {
      // 淡出
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setOpacity(1 - progress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [visible, duration]);
  
  return opacity;
}

/**
 * 状态指示器动画
 */
export function useStatusIndicator(state: string) {
  const [pulse, setPulse] = useState(false);
  
  useEffect(() => {
    if (state === 'working' || state === 'thinking') {
      setPulse(true);
    } else {
      setPulse(false);
    }
  }, [state]);
  
  return pulse;
}
