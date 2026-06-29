import useMascotStore from '../../store/mascotStore';
import { EStatus, STATUS_META } from '../../constants/mascotStates';
import useWebSocket from '../../hooks/useWebSocket';
import './ControlPanel.css';

/**
 * 演示控制面板
 * 用于手动切换小E所有状态、模拟工作流、查看状态信息
 */
export default function ControlPanel() {
  const status = useMascotStore((s) => s.status);
  const setStatus = useMascotStore((s) => s.setStatus);
  const soundEnabled = useMascotStore((s) => s.soundEnabled);
  const toggleSound = useMascotStore((s) => s.toggleSound);
  const wsConnected = useMascotStore((s) => s.wsConnected);
  const { simulateEvent } = useWebSocket();

  const statusList = Object.values(EStatus);

  /**
   * 模拟完整工作流：聆听 → 思考 → 应答 → 空闲
   */
  const simulateWorkflow = () => {
    simulateEvent('user_input_start');
    setTimeout(() => simulateEvent('thinking', { message: '分析合规数据中...' }), 1500);
    setTimeout(() => simulateEvent('streaming'), 3500);
    setTimeout(() => simulateEvent('completed', { message: '体检报告通过!' }), 6000);
  };

  /**
   * 模拟警告流程
   */
  const simulateWarning = () => {
    simulateEvent('warning', { message: '台账即将逾期，请及时更新' });
  };

  /**
   * 模拟警报流程
   */
  const simulateAlert = () => {
    simulateEvent('alert', { message: '排放数据超标! 请立即处理' });
  };

  /**
   * 模拟错误
   */
  const simulateError = () => {
    simulateEvent('error', { message: '数据获取失败，请检查网络' });
  };

  return (
    <div className="control-panel">
      <h3>🎮 小E状态控制面板</h3>
      <p className="subtitle">
        点击按钮手动切换状态 · 双击/长按小E触发彩蛋
      </p>

      {/* 状态按钮网格 */}
      <div className="status-grid">
        {statusList.map((s) => {
          const meta = STATUS_META[s];
          const isActive = status === s;
          return (
            <button
              key={s}
              className={`status-btn ${isActive ? 'active' : ''}`}
              onClick={() => setStatus(s, { force: true, message: meta.description, messageType: s === 'alert' ? 'alert' : s === 'warning' ? 'warning' : s === 'success' ? 'success' : 'tip' })}
              title={meta.description}
            >
              <span className="btn-icon">{meta.icon}</span>
              <span className="btn-label">{meta.label}</span>
            </button>
          );
        })}
      </div>

      {/* 工作流模拟 */}
      <div className="workflow-section">
        <h4>🔄 模拟工作流</h4>
        <div className="workflow-buttons">
          <button className="workflow-btn primary" onClick={simulateWorkflow}>
            ▶ 完整流程（聆听→思考→应答→成功）
          </button>
          <button className="workflow-btn" onClick={simulateWarning}>
            ⚠ 模拟提醒
          </button>
          <button className="workflow-btn" onClick={simulateAlert}>
            🚨 模拟警报
          </button>
          <button className="workflow-btn" onClick={simulateError}>
            ❌ 模拟错误
          </button>
        </div>
      </div>

      {/* 信息栏 */}
      <div className="info-section">
        <div className="ws-status">
          <span className={`ws-dot ${wsConnected ? 'connected' : ''}`} />
          <span>{wsConnected ? 'Agent已连接' : '模拟模式'}</span>
        </div>
        <button className="sound-toggle" onClick={toggleSound}>
          {soundEnabled ? '🔊 音效开' : '🔇 音效关'}
        </button>
      </div>
    </div>
  );
}
