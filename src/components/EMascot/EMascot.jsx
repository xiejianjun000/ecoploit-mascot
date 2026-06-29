import { useRef } from 'react';
import useMascotStore from '../../store/mascotStore';
import { STATUS_META } from '../../constants/mascotStates';
import { STATUS_COLORS } from '../../constants/mascotColors';
import MascotSvg from './MascotSvg';
import LottieLoader from '../LottieLoader/LottieLoader';
import useMascotEasterEggs from './MascotEasterEggs';
import useMascotAudio from '../../hooks/useMascotAudio';
import './MascotAnimations.css';
import './EMascot.css';

/**
 * 小E吉祥物主组件
 *
 * Props:
 * - size: 'small' | 'medium' | 'large' 预设尺寸
 * - showLabel: 是否显示状态标签
 * - showMessage: 是否显示对话消息
 * - className: 自定义类名
 * - onContextMenu: 快捷菜单回调 (移动端替换长按)
 */
export default function EMascot({
  size = 'medium',
  showLabel = true,
  showMessage = true,
  className = '',
  onContextMenu,
}) {
  const containerRef = useRef(null);
  const status = useMascotStore((s) => s.status);
  const message = useMascotStore((s) => s.message);
  const messageType = useMascotStore((s) => s.messageType);
  const isEasterEggActive = useMascotStore((s) => s.isEasterEggActive);
  const easterEggType = useMascotStore((s) => s.easterEggType);

  // 音效
  useMascotAudio();

  // 彩蛋交互
  useMascotEasterEggs(containerRef);

  const meta = STATUS_META[status] || STATUS_META.idle;
  const colors = STATUS_COLORS[status] || STATUS_COLORS.idle;

  const sizeMap = {
    small: { width: 120, height: 170 },
    medium: { width: 200, height: 280 },
    large: { width: 280, height: 380 },
  };

  const dimensions = sizeMap[size] || sizeMap.medium;

  const eggClass = isEasterEggActive ? `easter-egg--${easterEggType}` : '';

  return (
    <div className={`emascot-wrapper ${className}`}>
      {/* 吉祥物主体 */}
      <div
        ref={containerRef}
        className={`emascot-container ${eggClass}`}
        style={{ width: dimensions.width, height: dimensions.height }}
        title={meta.description}
        onContextMenu={(e) => {
          if (onContextMenu) {
            e.preventDefault();
            onContextMenu(e);
          }
        }}
      >
        <div className="emascot-svg-wrapper">
          {/* Lottie 加载器（如果动画文件存在则优先使用，否则降级到 SVG） */}
          <LottieLoader
            status={status}
            fallback={
              <MascotSvg
                status={status}
                isEasterEgg={isEasterEggActive}
                easterEggType={easterEggType}
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

      {/* 状态标签 */}
      {showLabel && (
        <div className="emascot-status-label">
          <span
            className="status-dot"
            style={{ background: colors.primary }}
          />
          <span>{meta.icon}</span>
          <span>{meta.label}</span>
        </div>
      )}
    </div>
  );
}
