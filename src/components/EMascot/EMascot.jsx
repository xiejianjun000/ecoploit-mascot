import { useRef } from 'react';
import useMascotStore from '../../store/mascotStore';
import { STATUS_META, EMOTION_META, EStatus } from '../../constants/mascotStates';
import { STATUS_COLORS } from '../../constants/mascotColors';
import MascotSvg from './MascotSvg';
import LottieLoader from '../LottieLoader/LottieLoader';
import useMascotEasterEggs from './MascotEasterEggs';
import useMascotAudio from '../../hooks/useMascotAudio';
import './MascotAnimations.css';
import './EMascot.css';

/**
 * 小E吉祥物主组件 — 小黄人版 ✨
 *
 * 与 OPENHUMAN RiveMascot 对标的优化：
 * - 二维状态空间：status × emotion（类似 face × pose）
 * - 待机自驱 (ambient pose rotation)：idle 时自动轮换动作
 * - 活动感知：工具调用时显示活动标签
 * - 情绪驱动面部：根据 emoji/文本自动推断表情
 * - touch() 重置休眠倒计时（类似 RiveMascot 的交互响应）
 * - 渐过度：加入 `animating` class 状态过渡而不是瞬间切换
 */
export default function EMascot({
  size = 'medium',
  showLabel = true,
  showMessage = true,
  showEmotion = true,
  className = '',
  onContextMenu,
}) {
  const containerRef = useRef(null);

  // 核心状态
  const status = useMascotStore((s) => s.status);
  const emotion = useMascotStore((s) => s.emotion);
  const message = useMascotStore((s) => s.message);
  const messageType = useMascotStore((s) => s.messageType);

  // 待机自驱
  const isAmbientActive = useMascotStore((s) => s.isAmbientActive);
  const ambientPose = useMascotStore((s) => s.ambientPose);

  // 活动感知
  const currentActivity = useMascotStore((s) => s.currentActivity);

  // 彩蛋
  const isEasterEggActive = useMascotStore((s) => s.isEasterEggActive);
  const easterEggType = useMascotStore((s) => s.easterEggType);

  // 交互
  const touch = useMascotStore((s) => s.touch);

  // 音效
  useMascotAudio();

  // 彩蛋交互
  useMascotEasterEggs(containerRef);

  // 元数据
  const meta = STATUS_META[status] || STATUS_META.idle;
  const emotionMeta = EMOTION_META[emotion] || EMOTION_META.neutral;
  const colors = STATUS_COLORS[status] || STATUS_COLORS.idle;

  // 尺寸映射
  const sizeMap = {
    small: { width: 120, height: 170 },
    medium: { width: 200, height: 280 },
    large: { width: 280, height: 380 },
  };
  const dimensions = sizeMap[size] || sizeMap.medium;

  // CSS class 组装
  const eggClass = isEasterEggActive ? `easter-egg--${easterEggType}` : '';
  const ambientClass = isAmbientActive ? `ambient--${ambientPose}` : '';

  // 点击容器 → touch()
  const handleContainerClick = (e) => {
    touch();
    if (onContextMenu) {
      e.preventDefault();
      onContextMenu(e);
    }
  };

  return (
    <div className={`emascot-wrapper ${className}`}>
      {/* 吉祥物主体 */}
      <div
        ref={containerRef}
        className={`emascot-container ${eggClass} ${ambientClass}`}
        style={{ width: dimensions.width, height: dimensions.height }}
        title={currentActivity ? `${currentActivity.icon} ${currentActivity.label}` : meta.description}
        onClick={handleContainerClick}
        onContextMenu={(e) => {
          if (onContextMenu) {
            e.preventDefault();
            onContextMenu(e);
          }
        }}
      >
        <div className="emascot-svg-wrapper">
          <LottieLoader
            status={status}
            fallback={
              <MascotSvg
                status={status}
                isEasterEgg={isEasterEggActive}
                easterEggType={easterEggType}
                emotion={emotion}
                isAmbientActive={isAmbientActive}
                ambientPose={ambientPose}
                currentActivity={currentActivity}
              />
            }
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>

      {/* 对话消息 */}
      {showMessage && message && (
        <div className={`emascot-message emascot-message--${messageType || 'tip'}`}>
          {message}
        </div>
      )}

      {/* 状态标签 + 情绪标签 */}
      {showLabel && (
        <div className="emascot-status-label">
          <span className="status-dot" style={{ background: colors.primary }} />
          <span>{meta.icon}</span>
          <span>{meta.label}</span>
          {showEmotion && emotion !== 'neutral' && (
            <span className="emotion-badge" title={emotionMeta.description}>
              {emotionMeta.icon}
            </span>
          )}
          {currentActivity && (
            <span className="activity-label">
              {currentActivity.icon}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
