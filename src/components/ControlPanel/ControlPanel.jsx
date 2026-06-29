import useMascotStore from '../../store/mascotStore';
import { EStatus, EEmotion, EMOTION_META, STATUS_META } from '../../constants/mascotStates';
import useWebSocket from '../../hooks/useWebSocket';
import './ControlPanel.css';

/**
 * 小E控制面板 — 小黄人版 ✨
 *
 * 新增：
 * - 情绪模拟器：手动触发情绪表情
 * - 活动模拟器：模拟工具调用活动
 * - 待机自驱监控：查看 ambient pose 状态
 * - 扩展工作流：带情绪和活动的完整模拟
 */
export default function ControlPanel() {
  const status = useMascotStore((s) => s.status);
  const emotion = useMascotStore((s) => s.emotion);
  const setStatus = useMascotStore((s) => s.setStatus);
  const showEmotion = useMascotStore((s) => s.showEmotion);
  const setActivity = useMascotStore((s) => s.setActivity);
  const clearActivity = useMascotStore((s) => s.clearActivity);
  const soundEnabled = useMascotStore((s) => s.soundEnabled);
  const toggleSound = useMascotStore((s) => s.toggleSound);
  const wsConnected = useMascotStore((s) => s.wsConnected);
  const isAmbientActive = useMascotStore((s) => s.isAmbientActive);
  const ambientPose = useMascotStore((s) => s.ambientPose);
  const currentActivity = useMascotStore((s) => s.currentActivity);
  const { simulateEvent } = useWebSocket();

  const statusList = Object.values(EStatus);
  const emotionList = Object.values(EEmotion);

  /** 模拟工具调用 + 情绪 */
  const simulateToolCall = (toolName, activityText, reactionEmoji) => {
    simulateEvent('tool_call', {
      toolName,
      message: `正在${activityText}...`,
      text: activityText,
    });
  };

  /** 完整工作流：聆听 → 思考 + 活动 → 应答 → 成功 + 情绪 */
  const simulateEnhancedWorkflow = () => {
    simulateEvent('user_input_start');
    setTimeout(() => {
      simulateEvent('tool_call', {
        toolName: 'browser_search',
        message: '正在搜索合规数据...',
        text: '搜索合规数据',
      });
    }, 1000);
    setTimeout(() => {
      simulateEvent('thinking', {
        message: '分析合规数据中...',
        text: '分析完成，发现3项待处理',
      });
    }, 2500);
    setTimeout(() => {
      simulateEvent('streaming');
    }, 4000);
    setTimeout(() => {
      simulateEvent('completed', {
        message: '体检报告通过！',
        text: '所有检查项通过，合规评级优秀',
        reactionEmoji: '🎉',
      });
    }, 6500);
  };

  /** 带情绪的警告流程 */
  const simulateEmotionalWarning = () => {
    simulateEvent('tool_call', {
      toolName: 'data_audit',
      message: '审计台账中...',
      text: '发现异常数据',
    });
    setTimeout(() => {
      simulateEvent('warning', {
        message: '台账即将逾期，请及时更新',
        text: '请务必注意截止时间',
        reactionEmoji: '⚠️',
      });
    }, 1500);
  };

  /** 模拟各种活动 */
  const activities = [
    { toolName: 'file_write', label: '编辑文件', icon: '✍️' },
    { toolName: 'web_search', label: '搜索信息', icon: '🔍' },
    { toolName: 'screen_capture', label: '录制屏幕', icon: '📷' },
    { toolName: 'compile_build', label: '编译代码', icon: '💻' },
    { toolName: 'send_email', label: '发送消息', icon: '✉️' },
  ];

  return (
    <div className="control-panel">
      <h3>🎮 小E控制面板 <span className="version-badge">小黄人版</span></h3>
      <p className="subtitle">
        点击按钮切换状态 · 情绪引擎自动推断 · 待机自驱随时响应
      </p>

      {/* ===== 情绪指示器 ===== */}
      <div className="emotion-indicator">
        <span className="emotion-icon">{EMOTION_META[emotion]?.icon || '😐'}</span>
        <span className="emotion-label">{EMOTION_META[emotion]?.label || '平常'}</span>
        <span className="emotion-desc">{EMOTION_META[emotion]?.description || ''}</span>
      </div>

      {/* ===== 状态按钮网格 ===== */}
      <div className="status-grid">
        {statusList.map((s) => {
          const meta = STATUS_META[s];
          const isActive = status === s;
          return (
            <button
              key={s}
              className={`status-btn ${isActive ? 'active' : ''}`}
              onClick={() =>
                setStatus(s, {
                  force: true,
                  message: meta.description,
                  messageType: s === 'alert' ? 'alert' : s === 'warning' ? 'warning' : s === 'success' ? 'success' : 'tip',
                })
              }
              title={meta.description}
            >
              <span className="btn-icon">{meta.icon}</span>
              <span className="btn-label">{meta.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===== 情绪模拟 ===== */}
      <div className="section">
        <h4>😊 情绪模拟器</h4>
        <div className="emotion-grid">
          {emotionList.map((emo) => {
            const m = EMOTION_META[emo];
            const isActive = emotion === emo;
            return (
              <button
                key={emo}
                className={`emotion-btn ${isActive ? 'active' : ''}`}
                onClick={() => showEmotion(emo, 1500)}
                title={m.description}
              >
                <span className="btn-icon">{m.icon}</span>
                <span className="btn-label">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== 活动模拟 ===== */}
      <div className="section">
        <h4>⚡ 活动模拟器</h4>
        <div className="activity-grid">
          {activities.map((act) => (
            <button
              key={act.toolName}
              className={`activity-btn ${currentActivity?.activity?.includes(act.toolName.split('_')[0]) ? 'active' : ''}`}
              onClick={() => simulateToolCall(act.toolName, act.label, null)}
            >
              <span className="btn-icon">{act.icon}</span>
              <span className="btn-label">{act.label}</span>
            </button>
          ))}
          <button className="activity-btn clear-btn" onClick={clearActivity}>
            ✖ 清除
          </button>
        </div>
      </div>

      {/* ===== 工作流模拟 ===== */}
      <div className="section">
        <h4>🔄 模拟工作流</h4>
        <div className="workflow-buttons">
          <button className="workflow-btn primary" onClick={simulateEnhancedWorkflow}>
            ▶ 完整工作流（含活动+情绪）
          </button>
          <button className="workflow-btn" onClick={simulateEmotionalWarning}>
            ⚠ 警告（含审计活动）
          </button>
          <button className="workflow-btn" onClick={() => {
            simulateEvent('tool_call', { toolName: 'config_audit', message: '审计系统配置...' });
            setTimeout(() => simulateEvent('alert', { message: '配置异常! 请立即处理', reactionEmoji: '🚨' }), 1200);
          }}>
            🚨 警报（含审计）
          </button>
          <button className="workflow-btn" onClick={() => {
            simulateEvent('user_input_start');
            setTimeout(() => simulateEvent('thinking', { message: '分析中...' }), 1000);
            setTimeout(() => simulateEvent('error', { message: '连接超时' }), 2500);
          }}>
            ❌ 错误流程
          </button>
          <button className="workflow-btn" onClick={() => {
            setStatus(EStatus.IDLE, { force: true, text: 'hello! how are you?', reactionEmoji: '😊' });
          }}>
            👋 打招呼（开心）
          </button>
          <button className="workflow-btn" onClick={() => {
            setStatus(EStatus.IDLE, { force: true, text: 'hmm, not sure which one you mean...' });
          }}>
            🤔 困惑（困惑）
          </button>
        </div>
      </div>

      {/* ===== 状态信息 ===== */}
      <div className="info-section">
        <div className="info-left">
          <div className="ws-status">
            <span className={`ws-dot ${wsConnected ? 'connected' : ''}`} />
            <span>{wsConnected ? 'Agent已连接' : '模拟模式'}</span>
          </div>
          <div className="ambient-status">
            <span className="ambient-dot" style={{ background: isAmbientActive ? '#00B4D8' : '#6C757D' }} />
            <span>{isAmbientActive ? `${ambientPose}` : '待机中'}</span>
          </div>
        </div>
        <div className="info-right">
          <button className="sound-toggle" onClick={toggleSound}>
            {soundEnabled ? '🔊 音效开' : '🔇 音效关'}
          </button>
        </div>
      </div>
    </div>
  );
}
