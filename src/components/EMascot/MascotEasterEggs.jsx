import { useEffect, useRef, useCallback } from 'react';
import useMascotStore from '../../store/mascotStore';

/**
 * 小E彩蛋 Hook
 * 提供双击、长按交互与声波可视化
 */
export default function useMascotEasterEggs(containerRef) {
  const triggerEasterEgg = useMascotStore((s) => s.triggerEasterEgg);

  // 双击检测
  const clickTimerRef = useRef(null);
  const lastClickRef = useRef(0);

  const handleClick = useCallback(() => {
    const now = Date.now();
    if (now - lastClickRef.current < 350) {
      // 双击！
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      triggerEasterEgg('surprised');
      lastClickRef.current = 0;
      return;
    }
    lastClickRef.current = now;
    clickTimerRef.current = setTimeout(() => {
      // 单击，不做特别处理
    }, 360);
  }, [triggerEasterEgg]);

  // 长按检测
  const pressTimerRef = useRef(null);

  const handlePointerDown = useCallback(() => {
    pressTimerRef.current = setTimeout(() => {
      triggerEasterEgg('question');
    }, 800);
  }, [triggerEasterEgg]);

  const handlePointerUp = useCallback(() => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }, []);

  // 绑定事件
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('click', handleClick);
    el.addEventListener('pointerdown', handlePointerDown);
    el.addEventListener('pointerup', handlePointerUp);
    el.addEventListener('pointerleave', handlePointerUp);

    return () => {
      el.removeEventListener('click', handleClick);
      el.removeEventListener('pointerdown', handlePointerDown);
      el.removeEventListener('pointerup', handlePointerUp);
      el.removeEventListener('pointerleave', handlePointerUp);
    };
  }, [containerRef, handleClick, handlePointerDown, handlePointerUp]);
}

/**
 * 声波可视化 Hook
 * 配合 Web Audio API，当用户语音输入时让耳朵反应
 */
export function useAudioVisualizer(analyserNode) {
  const barRefs = useRef([]);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!analyserNode) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyserNode.getByteFrequencyData(dataArray);

      // 取低频平均值作为耳朵缩放系数
      let sum = 0;
      for (let i = 0; i < 20; i++) {
        sum += dataArray[i];
      }
      const avg = sum / 20;
      const scale = 1 + (avg / 255) * 0.3;

      // 更新耳朵 scale
      barRefs.current.forEach((ref) => {
        if (ref) ref.style.transform = `scaleY(${scale})`;
      });
    };

    draw();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [analyserNode]);

  return barRefs;
}
