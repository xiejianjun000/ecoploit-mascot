/**
 * 小E吉祥物状态枚举与配置 — 小黄人版 ✨
 *
 * 重构自 OPENHUMAN 小黄人设计理念：
 * - 二维状态空间：功能状态 × 情绪状态
 * - 待机自驱 (Ambient Pose Rotation)：长时间 idle 时自动轮换动作
 * - 情绪引擎：根据上下文自动推断表情
 */

/** ===== 功能状态 (Function State) ===== */
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

/** ===== 情绪状态 (Emotion / Face) ===== */
export const EEmotion = {
  NEUTRAL: 'neutral',
  HAPPY: 'happy',
  CONFUSED: 'confused',
  CONCERNED: 'concerned',
  CURIOUS: 'curious',
  PROUD: 'proud',
  CAUTIOUS: 'cautious',
  CELEBRATING: 'celebrating',
  DANCING: 'dancing',
  SURPRISED: 'surprised',
};

/** ===== 待机自驱动作 (Ambient Poses) ===== */
export const AMBIENT_POSES = [
  'look_around',    // 东张西望
  'stretch',        // 伸懒腰
  'ear_twitch',     // 耳朵抖动
  'head_tilt',      // 歪头
  'blink_slowly',   // 缓慢眨眼
  'tail_swish',     // 尾巴轻摇
  'backpack_blink', // 背包灯光闪烁
];

/**
 * 情绪 → 功能状态过滤表
 * 某些情绪只在特定功能状态下有意义
 */
export const EMOTION_TO_STATUS = {
  [EEmotion.NEUTRAL]: ['idle'],
  [EEmotion.HAPPY]: ['idle', 'success', 'answering'],
  [EEmotion.CONFUSED]: ['thinking', 'listening'],
  [EEmotion.CONCERNED]: ['warning', 'alert', 'error'],
  [EEmotion.CURIOUS]: ['thinking', 'idle'],
  [EEmotion.PROUD]: ['success', 'answering'],
  [EEmotion.CAUTIOUS]: ['warning', 'thinking'],
  [EEmotion.CELEBRATING]: ['success'],
  [EEmotion.DANCING]: ['success', 'idle'],
  [EEmotion.SURPRISED]: ['idle', 'listening'],
};

/**
 * 情绪元数据 — 用于UI展示
 */
export const EMOTION_META = {
  [EEmotion.NEUTRAL]: { icon: '😐', label: '平常', description: '一切正常' },
  [EEmotion.HAPPY]: { icon: '😊', label: '开心', description: '任务顺利完成' },
  [EEmotion.CONFUSED]: { icon: '🤔', label: '困惑', description: '需要更多信息' },
  [EEmotion.CONCERNED]: { icon: '😟', label: '担忧', description: '遇到问题需要关注' },
  [EEmotion.CURIOUS]: { icon: '👀', label: '好奇', description: '发现感兴趣的信号' },
  [EEmotion.PROUD]: { icon: '⭐', label: '骄傲', description: '任务圆满完成' },
  [EEmotion.CAUTIOUS]: { icon: '⚠️', label: '谨慎', description: '需要注意风险' },
  [EEmotion.CELEBRATING]: { icon: '🎉', label: '庆祝', description: '大功告成！' },
  [EEmotion.DANCING]: { icon: '💃', label: '跳舞', description: '心情特别好' },
  [EEmotion.SURPRISED]: { icon: '😮', label: '惊讶', description: '出乎意料' },
};

/** ===== 状态元数据 ===== */
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

/** ===== 状态转换规则 ===== */
export const STATE_TRANSITIONS = {
  [EStatus.IDLE]: [EStatus.LISTENING, EStatus.THINKING, EStatus.SLEEP],
  [EStatus.LISTENING]: [EStatus.IDLE, EStatus.THINKING],
  [EStatus.THINKING]: [EStatus.ANSWERING, EStatus.WARNING, EStatus.ALERT, EStatus.ERROR],
  [EStatus.ANSWERING]: [EStatus.IDLE, EStatus.WARNING, EStatus.SUCCESS],
  [EStatus.WARNING]: [EStatus.IDLE, EStatus.ALERT],
  [EStatus.ALERT]: [EStatus.IDLE, EStatus.WARNING],
  [EStatus.SUCCESS]: [EStatus.IDLE],
  [EStatus.ERROR]: [EStatus.IDLE],
  [EStatus.SLEEP]: [EStatus.IDLE],
};

/** ===== 自动回退到 IDLE 的延迟(ms) ===== */
export const AUTO_BACK_TO_IDLE = {
  [EStatus.SUCCESS]: 3000,
  [EStatus.ERROR]: 4000,
  [EStatus.LISTENING]: 0,
  [EStatus.ALERT]: 0,
};

/**
 * ===== 待机自驱配置 (Idle Pose Rotation) =====
 * 灵感来自 OPENHUMAN RiveMascot 的 ambient pose 机制
 */
export const IDLE_ROTATION_CONFIG = {
  AMBIENT_IDLE_MIN_MS: 6_000,   // 自驱动作间隔下限
  AMBIENT_IDLE_MAX_MS: 12_000,  // 自驱动作间隔上限
  AMBIENT_HOLD_MIN_MS: 2_000,   // 动作保持时间下限
  AMBIENT_HOLD_MAX_MS: 4_000,   // 动作保持时间上限
  SLEEP_AFTER_MS: 30_000,       // 无操作后进入休眠
};

/**
 * ===== 情绪推断引擎 =====
 * 灵感来自 OPENHUMAN pickConversationAckFace
 * 根据 emoji 和文本关键词推断小E的情绪
 */
export const EMOTION_EMOJI_MAP = {
  '✅': EEmotion.PROUD,
  '🎉': EEmotion.CELEBRATING,
  '🙌': EEmotion.CELEBRATING,
  '😊': EEmotion.HAPPY,
  '😄': EEmotion.HAPPY,
  '👍': EEmotion.HAPPY,
  '💪': EEmotion.HAPPY,
  '⭐': EEmotion.PROUD,
  '🌟': EEmotion.PROUD,
  '🏆': EEmotion.PROUD,
  '💯': EEmotion.PROUD,
  '🚀': EEmotion.PROUD,
  '🔍': EEmotion.CURIOUS,
  '🧐': EEmotion.CURIOUS,
  '👀': EEmotion.CURIOUS,
  '🤔': EEmotion.CONFUSED,
  '❓': EEmotion.CONFUSED,
  '⚠️': EEmotion.CAUTIOUS,
  '💡': EEmotion.CAUTIOUS,
  '🚨': EEmotion.CONCERNED,
  '❌': EEmotion.CONCERNED,
  '😕': EEmotion.CONCERNED,
  '😟': EEmotion.CONCERNED,
};

export const EMOTION_TEXT_MAP = [
  { pattern: /\b(sorry|apologize|failed|error|cannot|can't|unable|blocked|problem)\b/i, emotion: EEmotion.CONCERNED },
  { pattern: /\b(not sure|unclear|ambiguous|clarify|which one|need more)\b/i, emotion: EEmotion.CONFUSED },
  { pattern: /\b(done|completed|fixed|success|successful|ready|great|nice)\b/i, emotion: EEmotion.HAPPY },
  { pattern: /\b(congratulations|well done|bravo|amazing|fantastic|incredible)\b/i, emotion: EEmotion.CELEBRATING },
  { pattern: /\b(interesting|fascinating|curious|let me check|let me look)\b/i, emotion: EEmotion.CURIOUS },
  { pattern: /\b(be careful|warning|caution|heads up|please note|make sure)\b/i, emotion: EEmotion.CAUTIOUS },
  { pattern: /^(hello|hey|hi|good (morning|afternoon|evening)|welcome)\b/i, emotion: EEmotion.HAPPY },
];

/**
 * 工具名 → 活动映射 (Tool → Activity)
 * 灵感来自 OPENHUMAN toolToActivityFace
 */
export const TOOL_ACTIVITY_MAP = [
  { patterns: ['file_write', 'edit_file', 'apply_patch', 'create_file', 'write'], activity: 'writing', icon: '✍️', label: '正在编辑文件' },
  { patterns: ['browser', 'web_search', 'web_fetch', 'read_file', 'search', 'grep', 'find'], activity: 'reading', icon: '🔍', label: '正在搜索信息' },
  { patterns: ['screen', 'screenshot', 'capture'], activity: 'recording', icon: '📷', label: '正在录制屏幕' },
  { patterns: ['email', 'send', 'message'], activity: 'communicating', icon: '📨', label: '正在发送消息' },
  { patterns: ['code', 'compile', 'build', 'deploy'], activity: 'coding', icon: '💻', label: '正在编写代码' },
];

/**
 * 工具 → 活动推断函数
 */
export function inferActivity(toolName) {
  const name = toolName.toLowerCase();
  for (const entry of TOOL_ACTIVITY_MAP) {
    if (entry.patterns.some(p => name.includes(p))) {
      return entry;
    }
  }
  return null;
}
