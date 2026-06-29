import { useEffect, useRef } from 'react';
import useMascotStore from '../store/mascotStore';
import { EStatus } from '../constants/mascotStates';

/**
 * 小E音效 Hook
 * 根据不同状态播放对应音效
 *
 * 音效文件路径约定：/sounds/{status}.mp3
 * 暂时使用 Web Audio API 生成简单提示音
 */
const SOUND_CONFIG = {
  [EStatus.LISTENING]: { freq: 880, duration: 0.1, type: 'sine' },
  [EStatus.THINKING]: { freq: 440, duration: 0.15, type: 'triangle' },
  [EStatus.ANSWERING]: { freq: 660, duration: 0.08, type: 'sine' },
  [EStatus.WARNING]: { freq: 520, duration: 0.3, type: 'square' },
  [EStatus.ALERT]: { freq: 330, duration: 0.5, type: 'sawtooth' },
  [EStatus.SUCCESS]: { freq: 1047, duration: 0.2, type: 'sine' },
  [EStatus.ERROR]: { freq: 220, duration: 0.4, type: 'sawtooth' },
};

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

function playTone(freq, duration, type = 'sine') {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // 静默失败：浏览器可能阻止自动播放
  }
}

export default function useMascotAudio() {
  const status = useMascotStore((s) => s.status);
  const soundEnabled = useMascotStore((s) => s.soundEnabled);
  const prevStatusRef = useRef(status);

  useEffect(() => {
    if (!soundEnabled) return;
    if (prevStatusRef.current === status) return;

    const config = SOUND_CONFIG[status];
    if (config) {
      playTone(config.freq, config.duration, config.type);
    }

    prevStatusRef.current = status;
  }, [status, soundEnabled]);
}
