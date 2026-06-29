import { COLORS, STATUS_COLORS } from '../../constants/mascotColors';

/**
 * 小E吉祥物 SVG 矢量角色 — 品牌色系统 v2
 *
 * 色彩映射：
 * 皮毛 = #2D6A4F 生态新芽绿
 * 腹部 = #F1FAEE 数据白
 * 安全帽 = #00B4D8 科技清流绿 (40%透明)，帽檐 #D4AF37 法规金
 * 尾巴 = #00B4D8 → #2D6A4F 渐变，呈现数据屏质感
 * 背包 = #1D3557 科技深蓝 外壳 + #00B4D8 发光屏
 * 眼睛 = #00B4D8 虹膜 + #1D3557 瞳孔
 * 鼻头 = #1D3557
 * 胸章 = 盾形，色随状态变
 */
export default function MascotSvg({ status = 'idle', isEasterEgg = false, easterEggType = null }) {
  const sc = STATUS_COLORS[status] || STATUS_COLORS.idle;
  const surprised = isEasterEgg && easterEggType === 'surprised';
  const question = isEasterEgg && easterEggType === 'question';

  return (
    <svg
      viewBox="0 0 300 380"
      xmlns="http://www.w3.org/2000/svg"
      className="mascot-svg"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        {/* 身体渐变：生态绿基调，腹部渐亮 */}
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

        {/* 尾巴数据屏渐变：科技蓝绿 → 生态绿 */}
        <linearGradient id="tailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={COLORS.techBlue} />
          <stop offset="100%" stopColor={COLORS.furMain} />
        </linearGradient>

        {/* 背包外壳渐变 */}
        <linearGradient id="backpackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#253D5B" />
          <stop offset="100%" stopColor={COLORS.deepBlue} />
        </linearGradient>

        {/* 发光滤镜 */}
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

        {/* 帽子扫描线纹理 */}
        <pattern id="scanLines" width="4" height="4" patternUnits="userSpaceOnUse">
          <line x1="0" y1="2" x2="4" y2="2" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* ====== 背景光晕 ====== */}
      <ellipse
        cx="150" cy="305" rx="65" ry="14"
        fill={sc.primary}
        opacity="0.1"
        className="mascot-shadow-glow"
      />

      {/* ====== 尾巴 ====== */}
      <g className={`mascot-tail mascot-tail--${status}`}>
        {status === 'alert' ? (
          /* 警报：盾牌形态 + 红色描边 */
          <g>
            <path
              d="M 178 308 Q 198 255 218 262 Q 238 270 228 315 Q 218 348 178 338 Z"
              fill="url(#tailGrad)"
              opacity="0.85"
              stroke={COLORS.alertRed}
              strokeWidth="2.5"
            />
            <text x="204" y="310" fontSize="18" textAnchor="middle" fill={COLORS.alertRed} fontWeight="bold">🛡</text>
          </g>
        ) : status === 'answering' ? (
          /* 应答：尾巴如报告书展开，显示数据线条 */
          <g>
            <path
              d="M 175 312 Q 202 275 238 270 L 244 280 Q 210 298 180 332 Z"
              fill="url(#tailGrad)"
              stroke={COLORS.furLight}
              strokeWidth="1"
            />
            {/* 数据行 */}
            <line x1="190" y1="285" x2="228" y2="278" stroke={COLORS.dataWhite} strokeWidth="1" opacity="0.55" />
            <line x1="188" y1="293" x2="232" y2="284" stroke={COLORS.dataWhite} strokeWidth="0.8" opacity="0.4" />
            <line x1="186" y1="301" x2="230" y2="291" stroke={COLORS.dataWhite} strokeWidth="0.8" opacity="0.3" />
          </g>
        ) : (
          /* 默认：扁平大尾，数据屏渐变 */
          <path
            d="M 175 312 Q 195 280 226 275 Q 242 270 236 292 Q 220 332 180 337 Z"
            fill="url(#tailGrad)"
            stroke={COLORS.furLight}
            strokeWidth="1"
          />
        )}
        {/* 尾巴上的数据流波纹 */}
        {status !== 'alert' && (
          <g className="tail-data-stream" opacity="0.4">
            <path d="M 190 295 Q 200 292 210 295" fill="none" stroke={COLORS.dataWhite} strokeWidth="0.7" />
            <path d="M 192 302 Q 202 299 212 302" fill="none" stroke={COLORS.dataWhite} strokeWidth="0.5" />
          </g>
        )}
      </g>

      {/* ====== 身体 ====== */}
      <g className={`mascot-body mascot-body--${status}`}>
        {/* 主躯干 */}
        <ellipse cx="150" cy="260" rx="60" ry="72" fill="url(#bodyGrad)" />
        {/* 肚皮 — 数据白 */}
        <ellipse cx="150" cy="270" rx="36" ry="48" fill={COLORS.belly} opacity="0.85" />
        {/* 前肢 */}
        <ellipse cx="117" cy="326" rx="17" ry="9" fill={COLORS.furMain} />
        <ellipse cx="183" cy="326" rx="17" ry="9" fill={COLORS.furMain} />
      </g>

      {/* ====== 数据背包 ====== */}
      <g className={`mascot-backpack mascot-backpack--${status}`}>
        {/* 外壳 */}
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
        {/* 数据流动块 */}
        <g className="backpack-data-stream">
          <rect x="203" y="212" width="5" height="12" rx="1" fill={COLORS.techBlue} opacity="0.7" />
          <rect x="211" y="212" width="5" height="12" rx="1" fill={COLORS.complianceGreen} opacity="0.55" />
        </g>
      </g>

      {/* ====== 手臂 ====== */}
      <g className={`mascot-arms mascot-arms--${status}`}>
        {/* 左臂 */}
        <path d="M 93 230 Q 72 256 83 282" stroke={COLORS.furMain} strokeWidth="13" strokeLinecap="round" fill="none" />
        {/* 右臂 */}
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
            <text x="222" y="250" fontSize="22" textAnchor="middle" fill={COLORS.complianceGreen}>👍</text>
          </g>
        )}
      </g>

      {/* ====== 头部 ====== */}
      <g className={`mascot-head mascot-head--${status}`}>
        {/* 面部底色 */}
        <ellipse cx="150" cy="174" rx="50" ry="44" fill={COLORS.furLight} />
        {/* 吻部 — 数据白 */}
        <ellipse cx="150" cy="184" rx="28" ry="20" fill={COLORS.belly} opacity="0.88" />

        {/* 耳朵 */}
        <ellipse cx="107" cy="143" rx="15" ry="10" fill={COLORS.furMain} />
        <ellipse cx="107" cy="143" rx="8" ry="5.5" fill={COLORS.belly} opacity="0.4" />
        <ellipse cx="193" cy="143" rx="15" ry="10" fill={COLORS.furMain} />
        <ellipse cx="193" cy="143" rx="8" ry="5.5" fill={COLORS.belly} opacity="0.4" />

        {/* 眼睛 */}
        <g className="mascot-eyes">
          {status === 'sleep' ? (
            <>
              <path d="M 130 170 Q 137 176 144 170" stroke={COLORS.deepBlue} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 156 170 Q 163 176 170 170" stroke={COLORS.deepBlue} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </>
          ) : surprised ? (
            <>
              <circle cx="137" cy="169" r="8.5" fill="white" stroke={COLORS.deepBlue} strokeWidth="1.5" />
              <circle cx="137" cy="169" r="4.5" fill={COLORS.eyePupil} />
              <circle cx="163" cy="169" r="8.5" fill="white" stroke={COLORS.deepBlue} strokeWidth="1.5" />
              <circle cx="163" cy="169" r="4.5" fill={COLORS.eyePupil} />
            </>
          ) : status === 'alert' ? (
            <>
              <circle cx="137" cy="169" r="7.5" fill="white" stroke={COLORS.deepBlue} strokeWidth="1.5" />
              <circle cx="137" cy="169" r="3.5" fill={COLORS.eyePupil} />
              <circle cx="163" cy="169" r="7.5" fill="white" stroke={COLORS.deepBlue} strokeWidth="1.5" />
              <circle cx="163" cy="169" r="3.5" fill={COLORS.eyePupil} />
              {/* 严肃眉毛 */}
              <path d="M 132 163 L 141 166" stroke={COLORS.deepBlue} strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 159 166 L 168 163" stroke={COLORS.deepBlue} strokeWidth="1.8" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* 正常 — 虹膜科技蓝绿 */}
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

        {/* 嘴巴 */}
        <g className="mascot-mouth">
          {status === 'success' ? (
            <path d="M 140 193 Q 150 204 160 193" stroke={COLORS.deepBlue} strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : status === 'error' ? (
            <path d="M 140 195 Q 150 189 160 195" stroke={COLORS.deepBlue} strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : status === 'alert' ? (
            <line x1="142" y1="193" x2="158" y2="193" stroke={COLORS.deepBlue} strokeWidth="2" strokeLinecap="round" />
          ) : question ? (
            <ellipse cx="150" cy="193" rx="4" ry="5" fill={COLORS.deepBlue} />
          ) : (
            <path d="M 143 192 Q 150 198 157 192" stroke={COLORS.deepBlue} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          )}
        </g>

        {/* 腮红 */}
        {status !== 'alert' && status !== 'error' && (
          <>
            <ellipse cx="121" cy="184" rx="7" ry="4" fill={COLORS.alertRed} opacity="0.1" />
            <ellipse cx="179" cy="184" rx="7" ry="4" fill={COLORS.alertRed} opacity="0.1" />
          </>
        )}
      </g>

      {/* ====== 安全帽 ====== */}
      <g className={`mascot-helmet mascot-helmet--${status}`}>
        {/* 帽体 */}
        <path
          d="M 107 154 Q 104 128 120 112 Q 136 97 150 95 Q 164 97 180 112 Q 196 128 193 154"
          fill="url(#helmetGrad)"
          stroke={sc.primary}
          strokeWidth="1.5"
          opacity="0.88"
        />
        {/* 扫描线纹理 */}
        <path
          d="M 107 154 Q 104 128 120 112 Q 136 97 150 95 Q 164 97 180 112 Q 196 128 193 154"
          fill="url(#scanLines)"
          opacity="0.5"
        />
        {/* 帽檐 — 法规金 */}
        <path
          d="M 103 151 Q 150 161 197 151"
          fill="none"
          stroke={COLORS.lawGold}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* 帽檐内侧辉光 */}
        <path
          d="M 103 151 Q 150 161 197 151"
          fill="none"
          stroke={COLORS.lawGold}
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.15"
        />

        {/* 思考：齿轮 + 脑电波 */}
        {status === 'thinking' && (
          <g className="helmet-gears">
            <circle cx="150" cy="124" r="13" fill="none" stroke={COLORS.techBlue} strokeWidth="2.2" opacity="0.55">
              <animateTransform attributeName="transform" type="rotate" from="0 150 124" to="360 150 124" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="150" cy="124" r="5.5" fill="none" stroke={COLORS.techBlue} strokeWidth="1.5" opacity="0.7">
              <animateTransform attributeName="transform" type="rotate" from="360 150 124" to="0 150 124" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* 脑电波 */}
            <path d="M 130 122 Q 135 118 140 124 T 150 124 T 160 124 T 170 124" fill="none" stroke={COLORS.techBlue} strokeWidth="1" opacity="0.35">
              <animate attributeName="opacity" values="0.35;0.7;0.35" dur="1.5s" repeatCount="indefinite" />
            </path>
          </g>
        )}

        {/* 错误：裂缝 */}
        {status === 'error' && (
          <g className="helmet-crack">
            <path d="M 128 106 L 139 116 L 134 129" stroke="#5C0A0A" strokeWidth="1.5" fill="none" opacity="0.65" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 147 103 L 149 114" stroke="#5C0A0A" strokeWidth="1.5" fill="none" opacity="0.55" strokeLinecap="round" />
          </g>
        )}

        {/* 警报：面罩垂下 */}
        {status === 'alert' && (
          <g className="helmet-visor">
            <path
              d="M 109 154 Q 114 180 130 185 Q 150 191 170 185 Q 186 180 191 154"
              fill="rgba(230,57,70,0.18)"
              stroke={COLORS.alertRed}
              strokeWidth="2"
            />
          </g>
        )}

        {/* 帽顶装饰条 */}
        <rect x="140" y="93" width="20" height="5" rx="2.5" fill={sc.primary} opacity="0.85" />

        {/* 帽徽 E */}
        <text x="150" y="147" textAnchor="middle" fontSize="10" fontWeight="bold" fill={COLORS.lawGold} opacity="0.7">
          E
        </text>
      </g>

      {/* ====== 胸章（盾形） ====== */}
      <g className={`mascot-badge mascot-badge--${status}`}>
        {/* 盾形外框 */}
        <path
          d="M 150 235 L 163 240 L 163 252 Q 150 262 137 252 L 137 240 Z"
          fill="white"
          stroke={sc.badge}
          strokeWidth="2"
        />
        {/* 盾牌底色 */}
        <path
          d="M 150 238 L 160 242 L 160 252 Q 150 260 140 252 L 140 242 Z"
          fill={sc.badge}
          opacity="0.12"
        />
        {/* 符号 */}
        <text
          x="150" y="254"
          textAnchor="middle"
          fontSize={sc.badgeSymbol.length > 2 ? '11' : '14'}
          fontWeight="bold"
          fill={sc.badge}
        >
          {sc.badgeSymbol}
        </text>

        {/* 成功态内外辉光 */}
        {status === 'success' && (
          <path
            d="M 150 235 L 163 240 L 163 252 Q 150 262 137 252 L 137 240 Z"
            fill="none"
            stroke={sc.sparkle || COLORS.lawGold}
            strokeWidth="2"
            opacity="0.5"
          >
            <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.2s" repeatCount="indefinite" />
          </path>
        )}
      </g>

      {/* ====== 对话气泡 ====== */}
      {(status === 'thinking' || status === 'warning' || status === 'alert' || status === 'answering') && (
        <g className="mascot-speech-bubble">
          <ellipse cx="218" cy="114" rx="54" ry="24" fill="white" stroke={COLORS.techBlue} strokeWidth="1.2" opacity="0.95" />
          <polygon points="185,131 196,120 200,133" fill="white" />
          <polygon points="186,130 196,121 199,132" fill="none" stroke={COLORS.techBlue} strokeWidth="1" />
          <text x="218" y="117" textAnchor="middle" fontSize="9.5" fill={COLORS.deepBlue} fontWeight="500">
            {status === 'thinking' ? '分析中...' :
             status === 'answering' ? '正在回复' :
             status === 'warning' ? '请注意!' :
             status === 'alert' ? '高风险!' : ''}
          </text>
        </g>
      )}

      {/* ====== 彩蛋：惊吓水珠 ====== */}
      {surprised && (
        <g>
          <text x="78" y="128" fontSize="14" style={{animation: 'none'}}>💧</text>
          <text x="202" y="118" fontSize="12" style={{animation: 'none'}}>💧</text>
          <text x="118" y="98" fontSize="13" style={{animation: 'none'}}>✨</text>
        </g>
      )}

      {/* ====== 彩蛋：问号 ====== */}
      {question && (
        <text x="198" y="118" fontSize="30" textAnchor="middle" className="question-float">❓</text>
      )}
    </svg>
  );
}
