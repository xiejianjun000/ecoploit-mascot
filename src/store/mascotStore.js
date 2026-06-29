import { create } from 'zustand';
import {
  EStatus,
  EEmotion,
  AMBIENT_POSES,
  EMOTION_EMOJI_MAP,
  EMOTION_TEXT_MAP,
  EMOTION_TO_STATUS,
  STATE_TRANSITIONS,
  AUTO_BACK_TO_IDLE,
  IDLE_ROTATION_CONFIG,
  inferActivity,
} from '../constants/mascotStates';

/**
 * 小E吉祥物全局状态管理 — 小黄人版 ✨
 *
 * 优化要点：
 * 1. 二维状态：功能状态 × 情绪状态（类似 OPENHUMAN face × pose）
 * 2. 待机自驱：idle 时自动轮换 ambient 动作
 * 3. 情绪引擎：从 emoji/文本自动推断表情
 * 4. 活动感知：工具调用时自动匹配活动图标
 * 5. 渐进休眠：长时间 idle → sleep
 */
const useMascotStore = create((set, get) => ({
  // ---- 核心状态 ----
  status: EStatus.IDLE,
  previousStatus: null,

  // ---- 情绪状态 (注入小黄人的 face 概念) ----
  emotion: EEmotion.NEUTRAL,
  pendingEmotion: null,    // 待执行的瞬态情绪（完成后回退）

  // ---- 消息 ----
  message: null,
  messageType: null,

  // ---- 交互 ----
  isEasterEggActive: false,
  easterEggType: null,

  // ---- 待机自驱 (Ambient Pose Rotation) ----
  ambientPose: null,          // 当前 ambient 动作名
  isAmbientActive: false,     // 是否正在执行 ambient 动作
  lastInteractionAt: Date.now(), // 上次交互时间戳

  // ---- 活动感知 ----
  currentActivity: null,      // 当前活动信息 { activity, icon, label }

  // ---- 音效 ----
  soundEnabled: true,

  // ---- WebSocket ----
  wsConnected: false,

  // ---- 内部 ----
  _autoBackTimer: null,
  _ambientTimer: null,
  _sleepTimer: null,

  /** ===== 切换功能状态 ===== */
  setStatus: (newStatus, options = {}) => {
    const { status, _autoBackTimer, _ambientTimer, _sleepTimer } = get();

    if (status === newStatus && !options.force) return;

    // 检查状态转换
    const allowedTransitions = STATE_TRANSITIONS[status] || [];
    if (!options.force && !allowedTransitions.includes(newStatus)) {
      console.warn(`[Mascot] 不允许直接从 ${status} 切换到 ${newStatus}，先经过 IDLE`);
      set({
        previousStatus: status,
        status: EStatus.IDLE,
        message: null,
        messageType: null,
      });
      setTimeout(() => {
        get().setStatus(newStatus, { ...options, force: true });
      }, 300);
      return;
    }

    // 清除计时器
    if (_autoBackTimer) clearTimeout(_autoBackTimer);
    if (_ambientTimer) clearTimeout(_ambientTimer);
    if (_sleepTimer) clearTimeout(_sleepTimer);

    const update = {
      previousStatus: status,
      status: newStatus,
      message: options.message || null,
      messageType: options.messageType || null,
      lastInteractionAt: Date.now(),
      _ambientTimer: null,
      _sleepTimer: null,
    };

    // 离开 idle → 清除 ambient 状态
    if (newStatus !== EStatus.IDLE) {
      update.ambientPose = null;
      update.isAmbientActive = false;

      // 尝试绑定情绪（如果 options 带了 emoji 或 text）
      if (options.reactionEmoji) {
        const inferredEmotion = EMOTION_EMOJI_MAP[options.reactionEmoji];
        if (inferredEmotion) {
          const allowed = EMOTION_TO_STATUS[inferredEmotion] || [];
          if (allowed.includes(newStatus)) {
            update.emotion = inferredEmotion;
          }
        }
      } else if (options.text) {
        for (const entry of EMOTION_TEXT_MAP) {
          if (entry.pattern.test(options.text)) {
            const allowed = EMOTION_TO_STATUS[entry.emotion] || [];
            if (allowed.includes(newStatus)) {
              update.emotion = entry.emotion;
              break;
            }
          }
        }
      }
    }

    // 回到 idle → 启动 ambient rotation
    if (newStatus === EStatus.IDLE) {
      update.emotion = EEmotion.NEUTRAL;
      update.currentActivity = null;
      update._sleepTimer = setTimeout(() => {
        get().setStatus(EStatus.SLEEP, { force: true });
      }, IDLE_ROTATION_CONFIG.SLEEP_AFTER_MS);
      update._ambientTimer = get()._scheduleNextAmbient();
    }

    // 自动回退
    const autoBackDelay = AUTO_BACK_TO_IDLE[newStatus];
    if (autoBackDelay > 0) {
      update._autoBackTimer = setTimeout(() => {
        set({
          status: EStatus.IDLE,
          previousStatus: newStatus,
          emotion: EEmotion.NEUTRAL,
          message: null,
          messageType: null,
          currentActivity: null,
          _autoBackTimer: null,
        });
        get()._startIdleRotation();
      }, autoBackDelay);
    } else {
      update._autoBackTimer = null;
    }

    set(update);
  },

  /** ===== 瞬时情绪 (brief emotion, then back) ===== */
  showEmotion: (emotion, holdMs = 1200) => {
    const { status, _autoBackTimer } = get();
    const allowed = EMOTION_TO_STATUS[emotion] || [];
    if (!allowed.includes(status) && status !== EStatus.IDLE) return;

    const prevEmotion = get().emotion;
    set({ emotion, pendingEmotion: prevEmotion });

    if (_autoBackTimer) clearTimeout(_autoBackTimer);
    const timer = setTimeout(() => {
      set({ emotion: get().pendingEmotion || EEmotion.NEUTRAL, pendingEmotion: null });
    }, holdMs);
    return () => clearTimeout(timer);
  },

  /** ===== 设置活动感知 ===== */
  setActivity: (toolName) => {
    const activity = inferActivity(toolName);
    set({ currentActivity: activity });
  },

  clearActivity: () => {
    set({ currentActivity: null });
  },

  /** ===== 待机自驱 (Ambient Pose Rotation) ===== */
  _scheduleNextAmbient: () => {
    const { AMBIENT_IDLE_MIN_MS, AMBIENT_IDLE_MAX_MS } = IDLE_ROTATION_CONFIG;
    const delay = AMBIENT_IDLE_MIN_MS + Math.random() * (AMBIENT_IDLE_MAX_MS - AMBIENT_IDLE_MIN_MS);
    return setTimeout(() => {
      get()._triggerAmbient();
    }, delay);
  },

  _triggerAmbient: () => {
    const { status, ambientPose } = get();
    if (status !== EStatus.IDLE) return;

    const pool = AMBIENT_POSES.filter(p => p !== ambientPose);
    const pick = pool[Math.floor(Math.random() * pool.length)];

    set({ ambientPose: pick, isAmbientActive: true });

    const { AMBIENT_HOLD_MIN_MS, AMBIENT_HOLD_MAX_MS } = IDLE_ROTATION_CONFIG;
    const holdMs = AMBIENT_HOLD_MIN_MS + Math.random() * (AMBIENT_HOLD_MAX_MS - AMBIENT_HOLD_MIN_MS);

    const timer = setTimeout(() => {
      set({ isAmbientActive: false, _ambientTimer: null });
      // 重新调度下一次
      set({ _ambientTimer: get()._scheduleNextAmbient() });
    }, holdMs);
    set({ _ambientTimer: timer });
  },

  _startIdleRotation: () => {
    const timer = get()._scheduleNextAmbient();
    set({ _ambientTimer: timer });

    // 启动休眠倒计时
    const sleepTimer = setTimeout(() => {
      get().setStatus(EStatus.SLEEP, { force: true });
    }, IDLE_ROTATION_CONFIG.SLEEP_AFTER_MS);
    set({ _sleepTimer: sleepTimer });
  },

  /** ===== Agent 事件处理 ===== */
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
          text: data?.text,
          reactionEmoji: data?.reactionEmoji,
        });
        break;

      case 'tool_call':
        // 小黄人风格：根据工具名设置活动
        if (data?.toolName) {
          store.setActivity(data.toolName);
        }
        store.setStatus(EStatus.THINKING, {
          message: data?.message || '正在执行操作...',
          text: data?.text,
        });
        break;

      case 'streaming':
        store.setStatus(EStatus.ANSWERING);
        break;

      case 'warning':
        store.setStatus(EStatus.WARNING, {
          message: data?.message || '请注意以下事项',
          messageType: 'warning',
          text: data?.text,
          reactionEmoji: data?.reactionEmoji,
        });
        break;

      case 'alert':
        store.setStatus(EStatus.ALERT, {
          message: data?.message || '高风险警报！',
          messageType: 'alert',
          text: data?.text,
          reactionEmoji: data?.reactionEmoji,
        });
        break;

      case 'completed':
        store.setStatus(EStatus.SUCCESS, {
          message: data?.message || '处理完成！',
          messageType: 'success',
          text: data?.text,
          reactionEmoji: data?.reactionEmoji || '✅',
        });
        store.clearActivity();
        break;

      case 'error':
        store.setStatus(EStatus.ERROR, {
          message: data?.message || '系统遇到错误',
          messageType: 'error',
          text: data?.text,
        });
        store.clearActivity();
        break;

      case 'idle':
        store.setStatus(EStatus.IDLE);
        break;

      case 'sleep':
        store.setStatus(EStatus.SLEEP);
        break;

      case 'emotion': {
        // 直接设置瞬态情绪
        const timer = store.showEmotion(data?.emotion, data?.holdMs);
        break;
      }

      default:
        break;
    }
  },

  /** ===== 彩蛋 ===== */
  triggerEasterEgg: (type) => {
    set({ isEasterEggActive: true, easterEggType: type });
    setTimeout(() => {
      set({ isEasterEggActive: false, easterEggType: null });
    }, 2000);
  },

  /** ===== 音效 ===== */
  toggleSound: () => {
    set((state) => ({ soundEnabled: !state.soundEnabled }));
  },

  /** ===== WebSocket ===== */
  setWsConnected: (connected) => {
    set({ wsConnected: connected });
  },

  /** ===== 主动交互（用户点击/双击）—— 重置休眠倒计时 ===== */
  touch: () => {
    const { status, _sleepTimer } = get();
    if (status === EStatus.SLEEP) {
      set({ status: EStatus.IDLE, previousStatus: EStatus.SLEEP });
      get()._startIdleRotation();
    } else {
      set({ lastInteractionAt: Date.now() });
      if (_sleepTimer) {
        clearTimeout(_sleepTimer);
        const newSleepTimer = setTimeout(() => {
          get().setStatus(EStatus.SLEEP, { force: true });
        }, IDLE_ROTATION_CONFIG.SLEEP_AFTER_MS);
        set({ _sleepTimer: newSleepTimer });
      }
    }
  },

  /** ===== 清理 ===== */
  cleanup: () => {
    const { _autoBackTimer, _ambientTimer, _sleepTimer } = get();
    if (_autoBackTimer) clearTimeout(_autoBackTimer);
    if (_ambientTimer) clearTimeout(_ambientTimer);
    if (_sleepTimer) clearTimeout(_sleepTimer);
    set({
      status: EStatus.IDLE,
      _autoBackTimer: null,
      _ambientTimer: null,
      _sleepTimer: null,
    });
  },
}));

export default useMascotStore;
