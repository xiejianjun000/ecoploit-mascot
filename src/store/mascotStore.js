import { create } from 'zustand';
import { EStatus, STATE_TRANSITIONS, AUTO_BACK_TO_IDLE } from '../constants/mascotStates';

/**
 * 小E吉祥物全局状态管理
 * 驱动动画、交互、音效等所有行为
 */
const useMascotStore = create((set, get) => ({
  // ---- 核心状态 ----
  status: EStatus.IDLE,
  previousStatus: null,

  // ---- 消息 ----
  message: null,       // 小E的对话气泡文字
  messageType: null,   // 'tip' | 'warning' | 'alert' | 'success'

  // ---- 交互 ----
  isEasterEggActive: false,
  easterEggType: null, // 'surprised' | 'question' | 'festival'

  // ---- 音效 ----
  soundEnabled: true,

  // ---- WebSocket连接 ----
  wsConnected: false,

  // ---- 内部计时器 ----
  _autoBackTimer: null,

  /**
   * 切换小E状态
   * @param {string} newStatus - 目标状态 (EStatus枚举值)
   * @param {object} options - 可选参数
   * @param {string} options.message - 对话气泡文字
   * @param {string} options.messageType - 消息类型
   * @param {boolean} options.force - 强制切换，跳过转换规则检查
   */
  setStatus: (newStatus, options = {}) => {
    const { status, _autoBackTimer } = get();

    // 相同状态不重复触发
    if (status === newStatus && !options.force) return;

    // 检查状态转换是否合法
    const allowedTransitions = STATE_TRANSITIONS[status] || [];
    if (!options.force && !allowedTransitions.includes(newStatus)) {
      console.warn(
        `[Mascot] 不允许直接从 ${status} 切换到 ${newStatus}，先经过 IDLE`
      );
      // 自动插入 IDLE 过渡
      set({
        previousStatus: status,
        status: EStatus.IDLE,
        message: null,
        messageType: null,
      });
      // 短暂延迟后切换到目标状态
      setTimeout(() => {
        get().setStatus(newStatus, { ...options, force: true });
      }, 300);
      return;
    }

    // 清除旧的自动回退计时器
    if (_autoBackTimer) {
      clearTimeout(_autoBackTimer);
    }

    const update = {
      previousStatus: status,
      status: newStatus,
      message: options.message || null,
      messageType: options.messageType || null,
    };

    // 自动回退到 IDLE
    const autoBackDelay = AUTO_BACK_TO_IDLE[newStatus];
    if (autoBackDelay > 0) {
      update._autoBackTimer = setTimeout(() => {
        set({
          status: EStatus.IDLE,
          previousStatus: newStatus,
          message: null,
          messageType: null,
          _autoBackTimer: null,
        });
      }, autoBackDelay);
    } else {
      update._autoBackTimer = null;
    }

    set(update);
  },

  /**
   * 模拟 WebSocket 消息处理
   * 实际项目中由 useWebSocket hook 调用
   */
  handleAgentEvent: (event) => {
    const { type, data } = event;
    const store = get();

    switch (type) {
      case 'user_input_start':
        store.setStatus(EStatus.LISTENING);
        break;

      case 'thinking':
        store.setStatus(EStatus.THINKING, {
          message: data?.message || '正在分析中...',
        });
        break;

      case 'streaming':
        store.setStatus(EStatus.ANSWERING);
        break;

      case 'warning':
        store.setStatus(EStatus.WARNING, {
          message: data?.message || '请注意以下事项',
          messageType: 'warning',
        });
        break;

      case 'alert':
        store.setStatus(EStatus.ALERT, {
          message: data?.message || '高风险警报!',
          messageType: 'alert',
        });
        break;

      case 'completed':
        store.setStatus(EStatus.SUCCESS, {
          message: data?.message || '处理完成!',
          messageType: 'success',
        });
        break;

      case 'error':
        store.setStatus(EStatus.ERROR, {
          message: data?.message || '系统遇到错误',
          messageType: 'error',
        });
        break;

      case 'idle':
        store.setStatus(EStatus.IDLE);
        break;

      case 'sleep':
        store.setStatus(EStatus.SLEEP);
        break;

      default:
        break;
    }
  },

  /**
   * 触发彩蛋
   */
  triggerEasterEgg: (type) => {
    set({
      isEasterEggActive: true,
      easterEggType: type,
    });
    // 彩蛋播放2秒后恢复
    setTimeout(() => {
      set({ isEasterEggActive: false, easterEggType: null });
    }, 2000);
  },

  /**
   * 切换音效
   */
  toggleSound: () => {
    set((state) => ({ soundEnabled: !state.soundEnabled }));
  },

  /**
   * 设置 WebSocket 连接状态
   */
  setWsConnected: (connected) => {
    set({ wsConnected: connected });
  },

  /**
   * 清理（组件卸载时调用）
   */
  cleanup: () => {
    const { _autoBackTimer } = get();
    if (_autoBackTimer) clearTimeout(_autoBackTimer);
    set({
      status: EStatus.IDLE,
      _autoBackTimer: null,
    });
  },
}));

export default useMascotStore;
