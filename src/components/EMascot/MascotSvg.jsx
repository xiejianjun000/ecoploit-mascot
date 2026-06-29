import { COLORS, STATUS_COLORS } from '../../constants/mascotColors';
import { EEmotion, AMBIENT_POSES } from '../../constants/mascotStates';

/**
 * 小E吉祥物 SVG 矢量角色 — 小黄人版 ✨
 *
 * 优化要点（灵感来自 OPENHUMAN RiveMascot 设计体系）：
 * - 情绪驱动面部：开心眼/困惑眉/惊讶嘴
 * - 活动感知：工具调用时显示对应活动道具
 * - 口型动画：answering 时嘴巴开合模拟说话
 * - 待机自驱：idle 时执行 ambient 动作（东张西望、伸懒腰、耳朵抖动...）
 */
export default function MascotSvg({
  status = 'idle',
  isEasterEgg = false,
  easterEggType = null,
  emotion = EEmotion.NEUTRAL,
  isAmbientActive = false,
  ambientPose = null,
  currentActivity = null,
}) {
  const sc = STATUS_COLORS[status] || STATUS_COLORS.idle;
  const surprised = isEasterEgg && easterEggType === 'surprised';
  const question = isEasterEgg && easterEggType === 'question';

  const isListening = status === 'listening';
  const isThinking = status === 'thinking';
  const isAnswering = status === 'answering';
  const isWarning = status === 'warning';
  const isAlert = status === 'alert';
  const isSuccess = status === 'success';
  const isError = status === 'error';
  const isSleep = status === 'sleep';
  const isIdle = status === 'idle';

  // === 情绪驱动面部 ===
  const isHappy = emotion === EEmotion.HAPPY || emotion === EEmotion.PROUD || emotion === EEmotion.CELEBRATING;
  const isConfused = emotion === EEmotion.CONFUSED;
  const isConcerned = emotion === EEmotion.CONCERNED;
  const isCurious = emotion === EEmotion.CURIOUS;
  const isDancing = emotion === EEmotion.DANCING;
  const isSurprisedFace = emotion === EEmotion.SURPRISED || surprised;

  return (
    <svg
      viewBox="0 0 300 380"
      xmlns="http://www.w3.org/2000/svg"
      className={`mascot-svg ${status} emotion-${emotion}${isAmbientActive ? ' ambient-' + ambientPose : ''}`}
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        {/* 身体渐变 */}
        <radialGradient id="bodyGrad" cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor={COLORS.furLight} />
          <stop offset="55%" stopColor={COLORS.furMain} />
          <stop offset="100%" stopColor="#1B4D38" />
        </radialGradient>

        {/* 安全帽渐变 */}
        <radialGradient id="helmetGrad" cx="38%" cy="28%" r="62%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="45%" stopColor={sc.helmet} />
          <stop offset="100%" stopColor="rgba(0,0,0,0.06)" />
        </radialGradient>

        {/* 数据屏尾巴渐变 */}
        <linearGradient id="tailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={COLORS.techBlue} />
          <stop offset="100%" stopColor={COLORS.furMain} />
        </linearGradient>

        {/* 背包外壳渐变 */}
        <linearGradient id="backpackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#253D5B" />
          <stop offset="100%" stopColor={COLORS.deepBlue} />
        </linearGradient>

        {/* 辉光滤镜 */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 帽子扫描线 */}
        <pattern id="scanLines" width="4" height="4" patternUnits="userSpaceOnUse">
          <line x1="0" y1="2" x2="4" y2="2" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* ====== 背景光晕 ====== */}
      <ellipse cx="150" cy="305" rx="65" ry="14" fill={sc.primary} opacity="0.1" className="mascot-shadow-glow" />

      {/* ====== 尾巴 ====== */}
      {renderTail(status, isDancing)}

      {/* ====== 身体 ====== */}
      <g className={`mascot-body mascot-body--${status}`}>
        <ellipse cx="150" cy="260" rx="60" ry="72" fill="url(#bodyGrad)" />
        <ellipse cx="150" cy="270" rx="36" ry="48" fill={COLORS.belly} opacity="0.85" />
        {/* 脚 */}
        <ellipse cx="117" cy="326" rx="17" ry="9" fill={COLORS.furMain} />
        <ellipse cx="183" cy="326" rx="17" ry="9" fill={COLORS.furMain} />
      </g>

      {/* ====== 数据背包 ====== */}
      {renderBackpack(status, sc)}

      {/* ====== 手臂 ====== */}
      {renderArms(status, currentActivity, sc)}

      {/* ====== 头部 ====== */}
      {renderHead(status, sc, emotion, activityEmotionFlags({isHappy, isConfused, isConcerned, isCurious, isSurprisedFace, isAlert, isError, isSleep, question, isThinking, isAnswering, isListening, isSuccess}))}

      {/* ====== 安全帽 ====== */}
      {renderHelmet(status, sc)}

      {/* ====== 胸章 ====== */}
      {renderBadge(sc, status)}

      {/* ====== 对话气泡 ====== */}
      {(isThinking || isWarning || isAlert || isAnswering) && (
        <g className="mascot-speech-bubble">
          <ellipse cx="218" cy="114" rx="58" ry="26" fill="white" stroke={COLORS.techBlue} strokeWidth="1.2" opacity="0.95" />
          <polygon points="185,133 196,122 200,135" fill="white" />
          <polygon points="186,132 196,123 199,134" fill="none" stroke={COLORS.techBlue} strokeWidth="1" />
          <text x="218" y="117" textAnchor="middle" fontSize="9.5" fill={COLORS.deepBlue} fontWeight="500">
            {isThinking ? '分析中...' : isAnswering ? '正在回复' : isWarning ? '请注意!' : isAlert ? '高风险!' : ''}
          </text>
        </g>
      )}

      {/* ====== 活动标签（工具调用时显示） ====== */}
      {currentActivity && (
        <g className="mascot-activity-badge">
          <rect x="84" y="290" width="132" height="22" rx="11" fill={COLORS.deepBlue} opacity="0.85" />
          <text x="150" y="305" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.dataWhite}>
            {currentActivity.icon} {currentActivity.label}
          </text>
        </g>
      )}

      {/* ====== 彩蛋 ====== */}
      {surprised && (
        <g>
          <text x="78" y="128" fontSize="14">💧</text>
          <text x="202" y="118" fontSize="12">💧</text>
          <text x="118" y="98" fontSize="13">✨</text>
        </g>
      )}
      {question && (
        <text x="198" y="118" fontSize="30" textAnchor="middle" className="question-float">❓</text>
      )}
    </svg>
  );
}

/** ===== 情绪标志汇总 ===== */
function activityEmotionFlags({isHappy, isConfused, isConcerned, isCurious, isSurprisedFace, isAlert, isError, isSleep, question, isThinking, isAnswering, isListening, isSuccess}) {
  return {isHappy, isConfused, isConcerned, isCurious, isSurprisedFace, isAlert, isError, isSleep, question, isThinking, isAnswering, isListening, isSuccess};
}

/** ===== 尾巴渲染 ===== */
function renderTail(status, isDancing) {
  return (
    <g className={`mascot-tail mascot-tail--${status}`}>
      {status === 'alert' ? (
        <g>
          <path d="M 178 308 Q 198 255 218 262 Q 238 270 228 315 Q 218 348 178 338 Z"
            fill="url(#tailGrad)" opacity="0.85" stroke={COLORS.alertRed} strokeWidth="2.5" />
          <text x="204" y="310" fontSize="18" textAnchor="middle" fill={COLORS.alertRed} fontWeight="bold">🛡</text>
        </g>
      ) : status === 'answering' ? (
        <g>
          <path d="M 175 312 Q 202 275 238 270 L 244 280 Q 210 298 180 332 Z"
            fill="url(#tailGrad)" stroke={COLORS.furLight} strokeWidth="1" />
          <line x1="190" y1="285" x2="228" y2="278" stroke={COLORS.dataWhite} strokeWidth="1" opacity="0.55" />
          <line x1="188" y1="293" x2="232" y2="284" stroke={COLORS.dataWhite} strokeWidth="0.8" opacity="0.4" />
          <line x1="186" y1="301" x2="230" y2="291" stroke={COLORS.dataWhite} strokeWidth="0.8" opacity="0.3" />
        </g>
      ) : isDancing ? (
        <g className="dance-tail">
          <path d="M 175 312 Q 195 280 226 275 Q 242 270 236 292 Q 220 332 180 337 Z"
            fill="url(#tailGrad)" stroke={COLORS.furLight} strokeWidth="1" />
          <g className="tail-sparkles" opacity="0.6">
            <circle cx="200" cy="278" r="2" fill={COLORS.lawGold} />
            <circle cx="215" cy="282" r="1.5" fill={COLORS.lawGold} />
            <circle cx="192" cy="285" r="1.5" fill={COLORS.lawGold} />
          </g>
        </g>
      ) : (
        <path d="M 175 312 Q 195 280 226 275 Q 242 270 236 292 Q 220 332 180 337 Z"
          fill="url(#tailGrad)" stroke={COLORS.furLight} strokeWidth="1" />
      )}
      {status !== 'alert' && (
        <g className="tail-data-stream" opacity="0.4">
          <path d="M 190 295 Q 200 292 210 295" fill="none" stroke={COLORS.dataWhite} strokeWidth="0.7" />
          <path d="M 192 302 Q 202 299 212 302" fill="none" stroke={COLORS.dataWhite} strokeWidth="0.5" />
        </g>
      )}
    </g>
  );
}

/** ===== 背包渲染 ===== */
function renderBackpack(status, sc) {
  return (
    <g className={`mascot-backpack mascot-backpack--${status}`}>
      <rect x="194" y="204" width="32" height="42" rx="6" fill="url(#backpackGrad)" />
      {/* 背带 */}
      <path d="M 194 210 Q 180 215 170 225" fill="none" stroke={COLORS.backpackStrap} strokeWidth="3" opacity="0.6" />
      <path d="M 194 230 Q 182 238 175 245" fill="none" stroke={COLORS.backpackStrap} strokeWidth="2.5" opacity="0.4" />
      {/* 屏幕 */}
      <rect x="199" y="209" width="22" height="19" rx="3" fill={COLORS.dataWhite} opacity="0.92" />
      <rect x="199" y="209" width="22" height="19" rx="3" fill={COLORS.backpackScreen} opacity="0.15" />
      {/* 天线 */}
      <line x1="210" y1="204" x2="210" y2="191" stroke={COLORS.techBlue} strokeWidth="2.5" />
      <circle cx="210" cy="188" r="3.5" fill={COLORS.techBlue} filter="url(#softGlow)" />
      {/* 数据流 */}
      <g className="backpack-data-stream">
        <rect x="203" y="212" width="5" height="12" rx="1" fill={COLORS.techBlue} opacity="0.7" />
        <rect x="211" y="212" width="5" height="12" rx="1" fill={COLORS.complianceGreen} opacity="0.55" />
      </g>
    </g>
  );
}

/** ===== 手臂渲染 ===== */
function renderArms(status, currentActivity, sc) {
  return (
    <g className={`mascot-arms mascot-arms--${status}`}>
      <path d="M 93 230 Q 72 256 83 282" stroke={COLORS.furMain} strokeWidth="13" strokeLinecap="round" fill="none" />
      <path d="M 207 230 Q 228 256 217 282" stroke={COLORS.furMain} strokeWidth="13" strokeLinecap="round" fill="none" />

      {status === 'answering' && (
        <g className="mascot-virtual-screen">
          <rect x="222" y="208" width="38" height="28" rx="4" fill="rgba(0,180,216,0.12)" stroke={COLORS.techBlue} strokeWidth="1" />
          <rect x="228" y="214" width="26" height="3" rx="1.5" fill={COLORS.techBlue} opacity="0.5" />
          <rect x="228" y="220" width="18" height="3" rx="1.5" fill={COLORS.techBlue} opacity="0.35" />
          <rect x="228" y="226" width="22" height="3" rx="1.5" fill={COLORS.techBlue} opacity="0.25" />
        </g>
      )}

      {status === 'warning' && (
        <g className="mascot-magnifier">
          <circle cx="234" cy="248" r="10" fill="none" stroke={COLORS.warmOrange} strokeWidth="2.5" />
          <line x1="242" y1="256" x2="255" y2="268" stroke={COLORS.steadyGray} strokeWidth="3" strokeLinecap="round" />
          {/* 放大镜闪亮 */}
          <circle cx="230" cy="244" r="2.5" fill="white" opacity="0.4">
            <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </g>
      )}

      {status === 'alert' && (
        <g className="mascot-alert-light">
          <rect x="224" y="224" width="8" height="15" rx="2" fill={COLORS.dataWhite} />
          <circle cx="228" cy="222" r="7" fill={COLORS.alertRed} filter="url(#glow)">
            <animate attributeName="opacity" values="1;0.25;1" dur="0.7s" repeatCount="indefinite" />
          </circle>
        </g>
      )}

      {status === 'success' && (
        <g className="mascot-thumb">
          <text x="222" y="250" fontSize="22" textAnchor="middle" fill={COLORS.complianceGreen}>
            👍
            <animate attributeName="y" values="250;245;250" dur="0.4s" repeatCount="indefinite" />
          </text>
        </g>
      )}

      {/* 活动感知道具 */}
      {currentActivity?.activity === 'writing' && (
        <g className="mascot-pen" filter="url(#softGlow)">
          <line x1="88" y1="230" x2="72" y2="278" stroke={COLORS.techBlue} strokeWidth="3" strokeLinecap="round" />
          <text x="76" y="285" fontSize="10" fill={COLORS.techBlue}>✏️</text>
        </g>
      )}

      {currentActivity?.activity === 'coding' && (
        <g className="mascot-code-icon">
          <text x="78" y="282" fontSize="18" opacity="0.7">&lt;/&gt;</text>
        </g>
      )}

      {currentActivity?.activity === 'communicating' && (
        <g className="mascot-email-icon">
          <text x="78" y="282" fontSize="16" opacity="0.7">✉️</text>
        </g>
      )}
    </g>
  );
}

/** ===== 头部渲染 ===== */
function renderHead(status, sc, emotion, flags) {
  const {isHappy, isConfused, isConcerned, isCurious, isSurprisedFace, isAlert, isError, isSleep, question, isThinking, isAnswering, isListening, isSuccess} = flags;

  // 口型动画参数
  const mouthIsOpen = isAnswering;

  return (
    <g className={`mascot-head mascot-head--${status} mascot-emotion--${emotion}`}>
      {/* 面部底色 */}
      <ellipse cx="150" cy="174" rx="50" ry="44" fill={COLORS.furLight} />

      {/* 吻部 */}
      <ellipse cx="150" cy="184" rx="28" ry="20" fill={COLORS.belly} opacity="0.88" />

      {/* 耳朵 */}
      <ellipse cx="107" cy="143" rx="15" ry="10" fill={COLORS.furMain}>
        {isListening && <animate attributeName="ry" values="10;14;10" dur="0.6s" repeatCount="indefinite" />}
      </ellipse>
      <ellipse cx="107" cy="143" rx="8" ry="5.5" fill={COLORS.belly} opacity="0.4" />
      <ellipse cx="193" cy="143" rx="15" ry="10" fill={COLORS.furMain}>
        {isListening && <animate attributeName="ry" values="10;14;10" dur="0.6s" repeatCount="indefinite" />}
      </ellipse>
      <ellipse cx="193" cy="143" rx="8" ry="5.5" fill={COLORS.belly} opacity="0.4" />

      {/* ====== 眼睛 ====== */}
      <g className="mascot-eyes">
        {isSleep ? (
          <>
            <path d="M 130 170 Q 137 176 144 170" stroke={COLORS.deepBlue} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 156 170 Q 163 176 170 170" stroke={COLORS.deepBlue} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ) : isSurprisedFace || (isAlert && isConcerned) ? (
          <>
            <circle cx="137" cy="169" r="8.5" fill="white" stroke={COLORS.deepBlue} strokeWidth="1.5" />
            <circle cx="137" cy="169" r="4.5" fill={COLORS.eyePupil} />
            <circle cx="163" cy="169" r="8.5" fill="white" stroke={COLORS.deepBlue} strokeWidth="1.5" />
            <circle cx="163" cy="169" r="4.5" fill={COLORS.eyePupil} />
          </>
        ) : isHappy ? (
          // 开心 — 弯弯的眼睛
          <g>
            <path d="M 130 170 Q 137 163 144 170" fill="none" stroke={COLORS.deepBlue} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 156 170 Q 163 163 170 170" fill="none" stroke={COLORS.deepBlue} strokeWidth="2.5" strokeLinecap="round" />
          </g>
        ) : isCurious ? (
          // 好奇 — 一只眼睁大，一只眯起
          <>
            <circle cx="137" cy="169" r="8" fill="white" stroke={COLORS.deepBlue} strokeWidth="1.5" />
            <circle cx="137" cy="169" r="4.5" fill={COLORS.eyeIris} />
            <circle cx="137" cy="168.5" r="2.5" fill={COLORS.eyePupil} />
            <path d="M 156 170 Q 163 165 170 170" fill="none" stroke={COLORS.deepBlue} strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : isConcerned || (isAlert && !isSurprisedFace) ? (
          // 担忧/警报 — 带皱眉
          <>
            <ellipse cx="137" cy="169" rx="7.5" ry="8" fill="white" stroke={COLORS.deepBlue} strokeWidth="1.5" />
            <circle cx="137" cy="169" r="4" fill={COLORS.eyeIris} />
            <circle cx="137" cy="168.5" r="2.2" fill={COLORS.eyePupil} />
            <ellipse cx="163" cy="169" rx="7.5" ry="8" fill="white" stroke={COLORS.deepBlue} strokeWidth="1.5" />
            <circle cx="163" cy="169" r="4" fill={COLORS.eyeIris} />
            <circle cx="163" cy="168.5" r="2.2" fill={COLORS.eyePupil} />
            <path d="M 132 163 L 141 166" stroke={COLORS.deepBlue} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 159 166 L 168 163" stroke={COLORS.deepBlue} strokeWidth="1.8" strokeLinecap="round" />
          </>
        ) : (
          // 正常/思考/回答 — 科技蓝绿虹膜
          <>
            <ellipse cx="137" cy="169" rx="7.5" ry="8" fill="white" stroke={COLORS.deepBlue} strokeWidth="1.5" />
            <circle cx="137" cy="169" r="4" fill={COLORS.eyeIris} />
            <circle cx="137" cy="168.5" r="2.2" fill={COLORS.eyePupil} />
            <circle cx="135.5" cy="167" r="1" fill="white" />
            <ellipse cx="163" cy="169" rx="7.5" ry="8" fill="white" stroke={COLORS.deepBlue} strokeWidth="1.5" />
            <circle cx="163" cy="169" r="4" fill={COLORS.eyeIris} />
            <circle cx="163" cy="168.5" r="2.2" fill={COLORS.eyePupil} />
            <circle cx="161.5" cy="167" r="1" fill="white" />
          </>
        )}
      </g>

      {/* 鼻子 */}
      <ellipse cx="150" cy="182.5" rx="7" ry="5" fill={COLORS.nose} />
      <ellipse cx="148" cy="181.5" rx="2" ry="1.5" fill="rgba(255,255,255,0.25)" />

      {/* ====== 嘴巴 ====== */}
      {mouthIsOpen ? (
        // 回答时 — 动画口型（小黄人风格 lipsync 效果）
        <g className="mascot-mouth mascot-mouth--talking">
          <motionMouth />
        </g>
      ) : isSuccess ? (
        <path className="mascot-mouth" d="M 140 193 Q 150 204 160 193" stroke={COLORS.deepBlue} strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : isError ? (
        <path className="mascot-mouth" d="M 140 195 Q 150 189 160 195" stroke={COLORS.deepBlue} strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : isAlert ? (
        <line className="mascot-mouth" x1="142" y1="193" x2="158" y2="193" stroke={COLORS.deepBlue} strokeWidth="2" strokeLinecap="round" />
      ) : isSurprisedFace ? (
        <ellipse className="mascot-mouth mascot-mouth--surprised" cx="150" cy="193" rx="5" ry="6" fill={COLORS.deepBlue} />
      ) : isConcerned || isConfused ? (
        <path className="mascot-mouth" d="M 142 194 Q 150 190 158 194" stroke={COLORS.deepBlue} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      ) : isHappy ? (
        <path className="mascot-mouth mascot-mouth--happy" d="M 140 193 Q 150 203 160 193" stroke={COLORS.deepBlue} strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : isSleep ? (
        <path className="mascot-mouth" d="M 144 191 Q 150 195 156 191" stroke={COLORS.deepBlue} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      ) : question ? (
        <ellipse className="mascot-mouth" cx="150" cy="193" rx="4" ry="5" fill={COLORS.deepBlue} />
      ) : (
        <path className="mascot-mouth" d="M 143 192 Q 150 198 157 192" stroke={COLORS.deepBlue} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      )}

      {/* 腮红 */}
      {!isAlert && !isError && !isSleep && (
        <>
          <ellipse cx="121" cy="184" rx="7" ry="4" fill={COLORS.alertRed} opacity={isConcerned ? 0.2 : isHappy ? 0.25 : 0.1}>
            {isHappy && <animate attributeName="opacity" values="0.2;0.35;0.2" dur="2s" repeatCount="indefinite" />}
          </ellipse>
          <ellipse cx="179" cy="184" rx="7" ry="4" fill={COLORS.alertRed} opacity={isConcerned ? 0.2 : isHappy ? 0.25 : 0.1} />
        </>
      )}

      {/* 思考 — 小灯泡 */}
      {isThinking && (
        <g className="mascot-thought-bulb">
          <circle cx="108" cy="161" r="5" fill={COLORS.lawGold} opacity="0.6" filter="url(#glow)">
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
    </g>
  );
}

/** ===== 动态口型 SVG 动画（小黄人风格） ===== */
function motionMouth() {
  const mouthStates = [
    { d: "M 142 193 Q 150 199 158 193", op: 1 },
    { d: "M 142 193 Q 150 185 158 193", op: 1 },
    { d: "M 142 192 Q 150 203 158 192", op: 1 },
    { d: "M 142 193 Q 150 190 158 193", op: 1 },
    { d: "M 142 191 Q 150 202 158 191", op: 1 },
  ];

  // 使用主动画模拟口型节奏
  return (
    <>
      {[0,1,2,3,4].map(i => (
        <ellipse
          key={i}
          cx="150"
          cy="193"
          rx={4 + (i === 2 ? 3 : i === 1 ? 2 : 1)}
          ry={3 + (i === 2 ? 3 : i === 1 ? 2 : 0)}
          fill={COLORS.deepBlue}
          opacity={0}
        >
          <animate attributeName="opacity" values="0;0;1;1;0;0" dur="0.8s" begin={`${i * 0.16}s`} repeatCount="indefinite" />
          <animate attributeName="rx" values="4;4;7;4;4;4" dur="0.8s" begin={`${i * 0.16}s`} repeatCount="indefinite" />
          <animate attributeName="ry" values="3;3;6;3;3;3" dur="0.8s" begin={`${i * 0.16}s`} repeatCount="indefinite" />
        </ellipse>
      ))}
    </>
  );
}

/** ===== 安全帽渲染 ===== */
function renderHelmet(status, sc) {
  return (
    <g className={`mascot-helmet mascot-helmet--${status}`}>
      {/* 帽体 */}
      <path
        d="M 107 154 Q 104 128 120 112 Q 136 97 150 95 Q 164 97 180 112 Q 196 128 193 154"
        fill="url(#helmetGrad)"
        stroke={sc.primary}
        strokeWidth="1.5"
        opacity="0.88"
      />
      <path
        d="M 107 154 Q 104 128 120 112 Q 136 97 150 95 Q 164 97 180 112 Q 196 128 193 154"
        fill="url(#scanLines)" opacity="0.5"
      />
      {/* 帽檐 */}
      <path d="M 103 151 Q 150 161 197 151" fill="none" stroke={COLORS.lawGold} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 103 151 Q 150 161 197 151" fill="none" stroke={COLORS.lawGold} strokeWidth="8" strokeLinecap="round" opacity="0.15" />

      {/* 思考 — 齿轮 */}
      {status === 'thinking' && (
        <g className="helmet-gears">
          <circle cx="150" cy="124" r="13" fill="none" stroke={COLORS.techBlue} strokeWidth="2.2" opacity="0.55">
            <animateTransform attributeName="transform" type="rotate" from="0 150 124" to="360 150 124" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="150" cy="124" r="5.5" fill="none" stroke={COLORS.techBlue} strokeWidth="1.5" opacity="0.7">
            <animateTransform attributeName="transform" type="rotate" from="360 150 124" to="0 150 124" dur="2s" repeatCount="indefinite" />
          </circle>
          <path d="M 130 122 Q 135 118 140 124 T 150 124 T 160 124 T 170 124" fill="none" stroke={COLORS.techBlue} strokeWidth="1" opacity="0.35">
            <animate attributeName="opacity" values="0.35;0.7;0.35" dur="1.5s" repeatCount="indefinite" />
          </path>
        </g>
      )}

      {/* 错误 — 裂缝 */}
      {status === 'error' && (
        <g className="helmet-crack">
          <path d="M 128 106 L 139 116 L 134 129" stroke="#5C0A0A" strokeWidth="1.5" fill="none" opacity="0.65" strokeLinecap="round" />
          <path d="M 147 103 L 149 114" stroke="#5C0A0A" strokeWidth="1.5" fill="none" opacity="0.55" strokeLinecap="round" />
        </g>
      )}

      {/* 警报 — 面罩 */}
      {status === 'alert' && (
        <g className="helmet-visor">
          <path d="M 109 154 Q 114 180 130 185 Q 150 191 170 185 Q 186 180 191 154" fill="rgba(230,57,70,0.18)" stroke={COLORS.alertRed} strokeWidth="2" />
        </g>
      )}

      {/* 帽顶装饰 */}
      <rect x="140" y="93" width="20" height="5" rx="2.5" fill={sc.primary} opacity="0.85" />
      {/* 帽徽 */}
      <text x="150" y="147" textAnchor="middle" fontSize="10" fontWeight="bold" fill={COLORS.lawGold} opacity="0.7">E</text>
    </g>
  );
}

/** ===== 胸章渲染 ===== */
function renderBadge(sc, status) {
  return (
    <g className={`mascot-badge mascot-badge--${status}`}>
      <path d="M 150 235 L 163 240 L 163 252 Q 150 262 137 252 L 137 240 Z" fill="white" stroke={sc.badge} strokeWidth="2" />
      <path d="M 150 238 L 160 242 L 160 252 Q 150 260 140 252 L 140 242 Z" fill={sc.badge} opacity="0.12" />
      <text x="150" y="254" textAnchor="middle" fontSize={sc.badgeSymbol?.length > 2 ? '11' : '14'} fontWeight="bold" fill={sc.badge}>
        {sc.badgeSymbol}
      </text>
      {status === 'success' && (
        <path d="M 150 235 L 163 240 L 163 252 Q 150 262 137 252 L 137 240 Z" fill="none" stroke={COLORS.lawGold} strokeWidth="2" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.2s" repeatCount="indefinite" />
        </path>
      )}
    </g>
  );
}
