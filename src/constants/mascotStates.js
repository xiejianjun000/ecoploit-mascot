/**
 * 小E吉祥物状态枚举与配置
 */
export const EStatus = {
  IDLE: 'idle',
  LISTENING: 'listening',
  THINKING: 'thinking',
  ANSWERING: 'answering',
  WARNING: 'warning',
  ALERT: 'alert',
  SUCCESS: 'success',
  ERROR: 'error',
  SLEEP: 'sleep',
};

/**
 * 状态元数据 — 用于UI展示
 */
export const STATUS_META = {
  [EStatus.IDLE]: {
    label: '待机中',
    description: '小E在角落待命，随时准备帮助你',
    icon: '🦦',
  },
  [EStatus.LISTENING]: {
    label: '聆听中',
    description: '正在接收你的输入...',
    icon: '👂',
  },
  [EStatus.THINKING]: {
    label: '思考中',
    description: '正在分析数据，请稍候',
    icon: '🤔',
  },
  [EStatus.ANSWERING]: {
    label: '回复中',
    description: '正在为你生成解答',
    icon: '💬',
  },
  [EStatus.WARNING]: {
    label: '请注意',
    description: '发现需要关注的事项',
    icon: '⚠️',
  },
  [EStatus.ALERT]: {
    label: '警报',
    description: '高风险事项，需要立即处理',
    icon: '🚨',
  },
  [EStatus.SUCCESS]: {
    label: '合规通过',
    description: '检查通过，一切正常',
    icon: '✅',
  },
  [EStatus.ERROR]: {
    label: '系统异常',
    description: '遇到了一些问题',
    icon: '❌',
  },
  [EStatus.SLEEP]: {
    label: '休眠中',
    description: '长时间未操作，小E休息了',
    icon: '😴',
  },
};

/**
 * 状态转换规则：哪些状态之间允许直接切换
 * 未列出的转换需要经过 IDLE 中间态
 */
export const STATE_TRANSITIONS = {
  [EStatus.IDLE]: [EStatus.LISTENING, EStatus.THINKING, EStatus.SLEEP],
  [EStatus.LISTENING]: [EStatus.IDLE, EStatus.THINKING],
  [EStatus.THINKING]: [EStatus.ANSWERING, EStatus.WARNING, EStatus.ALERT, EStatus.ERROR],
  [EStatus.ANSWERING]: [EStatus.IDLE, EStatus.WARNING],
  [EStatus.WARNING]: [EStatus.IDLE, EStatus.ALERT],
  [EStatus.ALERT]: [EStatus.IDLE, EStatus.WARNING],
  [EStatus.SUCCESS]: [EStatus.IDLE],
  [EStatus.ERROR]: [EStatus.IDLE],
  [EStatus.SLEEP]: [EStatus.IDLE],
};

/**
 * 状态自动回退到 IDLE 的延迟(ms)
 * SUCCESS 和 ERROR 是瞬时状态，自动回到 IDLE
 */
export const AUTO_BACK_TO_IDLE = {
  [EStatus.SUCCESS]: 3000,
  [EStatus.ERROR]: 4000,
  [EStatus.LISTENING]: 0, // 不回退，由输入事件控制
  [EStatus.ALERT]: 0,     // 不回退，需要用户确认
};
