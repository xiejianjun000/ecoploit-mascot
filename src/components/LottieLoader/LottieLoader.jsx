import { useEffect, useState, lazy, Suspense } from 'react';

/**
 * Lottie 动画加载器
 *
 * 优先级：
 * 1. 如果该状态有对应的 Lottie JSON 文件，优先播放 Lottie
 * 2. 否则降级使用 SVG + CSS 动画
 *
 * 设计师导出的 .json 文件放在 src/animations/ 目录下，
 * 命名格式：e_{status}.json (如 e_idle.json, e_thinking.json)
 */
const Lottie = lazy(() => import('lottie-react'));

// 已加载的动画缓存
const animationCache = {};

/**
 * 尝试动态加载 Lottie 动画 JSON
 * 如果文件不存在则返回 null，触发降级
 */
async function loadLottieAnimation(status) {
  if (animationCache[status] !== undefined) {
    return animationCache[status];
  }

  try {
    const module = await import(`../../animations/e_${status}.json`);
    animationCache[status] = module.default;
    return module.default;
  } catch {
    // 文件不存在，标记为降级模式
    animationCache[status] = null;
    return null;
  }
}

/**
 * Lottie 动画包装组件
 */
export default function LottieLoader({ status, fallback, style = {} }) {
  const [animData, setAnimData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    loadLottieAnimation(status).then((data) => {
      if (!cancelled) {
        setAnimData(data);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [status]);

  // 仍在加载中
  if (isLoading) {
    return fallback;
  }

  // Lottie 动画不可用，降级
  if (!animData) {
    return fallback;
  }

  // 播放 Lottie 动画
  return (
    <Suspense fallback={fallback}>
      <Lottie
        animationData={animData}
        loop={status !== 'success' && status !== 'error'}
        style={style}
      />
    </Suspense>
  );
}

/**
 * 检查指定状态是否有 Lottie 动画文件
 * 用于提前判断是否显示 Lottie 还是 SVG
 */
export async function hasLottieAnimation(status) {
  if (animationCache[status] !== undefined) {
    return animationCache[status] !== null;
  }
  const data = await loadLottieAnimation(status);
  return data !== null;
}
