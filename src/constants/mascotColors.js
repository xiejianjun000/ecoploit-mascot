/**
 * ECOPloit × 小E 品牌色彩设计系统
 *
 * 设计理念：
 * - 生态新芽绿 — 品牌主色，沉稳庄重，根基稳固
 * - 科技清流绿 — 品牌辅色，数据透明、AI理性
 * - 守护暖橙   — 预警，主动关怀而非被动告警
 * - 警示红     — 严重风险告警
 * - 法规金     — 点缀，专业感与品质感
 *
 * 配色比例：60% 中性色 · 30% 品牌主色 · 10% 点缀交互色
 */

export const COLORS = {
  // ===== 品牌核心色 =====
  ecoGreen: '#2D6A4F',       // 生态新芽绿 — 主色，小E毛发、Logo、主按钮
  techBlue: '#00B4D8',       // 科技清流绿 — 辅色，安全帽、链接、选中态

  // ===== 功能色 =====
  warmOrange: '#FF9F1C',     // 守护暖橙 — 预警图标、胸章(警告态)
  alertRed: '#E63946',       // 警示红 — 严重告警、删除操作
  complianceGreen: '#40916C',// 合规翠绿 — 成功状态、通过标识
  deepBlue: '#1D3557',       // 科技深蓝 — 深色背景、图表暗底、瞳孔

  // ===== 中性色 =====
  dataWhite: '#F1FAEE',      // 数据白 — 小E腹部、页面背景、卡片底色
  steadyGray: '#6C757D',     // 沉稳灰 — 次要文字、边框、禁用态

  // ===== 点缀色 =====
  lawGold: '#D4AF37',        // 法规金 — 安全帽檐描边、VIP标识、金粒子

  // ===== 小E身体色 =====
  furMain: '#2D6A4F',        // 主体皮毛 — 生态新芽绿
  furLight: '#40916C',       // 皮毛浅色 — 面部渐变
  belly: '#F1FAEE',          // 腹部/吻部 — 数据白
  eyeIris: '#00B4D8',        // 虹膜 — 科技清流绿
  eyePupil: '#1D3557',       // 瞳孔 — 科技深蓝
  nose: '#1D3557',           // 鼻头 — 科技深蓝

  // ===== 安全帽色 =====
  helmetDefault: 'rgba(0, 180, 216, 0.40)',
  helmetWarning: 'rgba(255, 159, 28, 0.45)',
  helmetAlert: 'rgba(230, 57, 70, 0.40)',
  helmetSuccess: 'rgba(64, 145, 108, 0.40)',
  helmetThinking: 'rgba(0, 180, 216, 0.25)',
  helmetSleep: 'rgba(108, 117, 125, 0.30)',

  // ===== 胸章色 =====
  badgeGreen: '#40916C',     // 合规翠绿 ✓
  badgeOrange: '#FF9F1C',    // 守护暖橙 !
  badgeRed: '#E63946',       // 警示红 ×
  badgeBlue: '#00B4D8',      // 科技清流绿 ...
  badgeGray: '#6C757D',      // 沉稳灰 ···
  badgeGold: '#D4AF37',      // 法规金 (成功闪光)

  // ===== 背包色 =====
  backpackShell: '#1D3557',  // 外壳：科技深蓝
  backpackScreen: 'rgba(0, 180, 216, 0.85)', // 屏幕：科技蓝绿发光
  backpackStrap: '#6C757D',  // 背带：沉稳灰

  // ===== UI 扩展色 =====
  uiPageBg: '#F1FAEE',
  uiCardBg: '#FFFFFF',
  uiSidebarBg: '#1D3557',
  uiSidebarText: '#F1FAEE',
  uiPrimaryBtn: '#2D6A4F',
  uiDangerBtn: '#E63946',
  uiLink: '#00B4D8',
  uiSuccessBg: '#E8F5E9',
  uiWarningBg: '#FFF3E0',

  // 无障碍 WCAG AA 验证
  // #2D6A4F + #F1FAEE = 6.8:1 ✓
  // #FF9F1C 图标仅装饰，不用于小文字
};

/**
 * 状态下对应的颜色映射
 * 特殊规则：
 * - 警报态安全帽变为红色，但主体皮毛不变，避免整体变红产生不安
 * - 成功态胸章高亮翠绿 + 法规金粒子特效
 */
export const STATUS_COLORS = {
  idle: {
    helmet: COLORS.helmetDefault,
    badge: COLORS.badgeGreen,
    badgeSymbol: '✓',
    primary: COLORS.techBlue,
  },
  listening: {
    helmet: COLORS.helmetDefault,
    badge: COLORS.badgeBlue,
    badgeSymbol: '...',
    primary: COLORS.techBlue,
  },
  thinking: {
    helmet: COLORS.helmetThinking,
    badge: COLORS.badgeBlue,
    badgeSymbol: '...',
    primary: COLORS.techBlue,
  },
  answering: {
    helmet: COLORS.helmetDefault,
    badge: COLORS.badgeGreen,
    badgeSymbol: '✓',
    primary: COLORS.ecoGreen,
  },
  warning: {
    helmet: COLORS.helmetWarning,
    badge: COLORS.badgeOrange,
    badgeSymbol: '!',
    primary: COLORS.warmOrange,
  },
  alert: {
    helmet: COLORS.helmetAlert,
    badge: COLORS.badgeRed,
    badgeSymbol: '×',
    primary: COLORS.alertRed,
  },
  success: {
    helmet: COLORS.helmetSuccess,
    badge: COLORS.badgeGreen,
    badgeSymbol: '✓',
    primary: COLORS.complianceGreen,
    sparkle: COLORS.badgeGold,  // 金粒子特效
  },
  error: {
    helmet: COLORS.helmetAlert,
    badge: COLORS.badgeRed,
    badgeSymbol: '×',
    primary: COLORS.alertRed,
  },
  sleep: {
    helmet: COLORS.helmetSleep,
    badge: COLORS.badgeGray,
    badgeSymbol: '···',
    primary: COLORS.steadyGray,
  },
};
