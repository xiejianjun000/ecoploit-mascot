import EMascot from './components/EMascot/EMascot';
import ControlPanel from './components/ControlPanel/ControlPanel';
import './App.css';

function App() {
  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>
          ECOPloit <span className="accent">小E</span> 吉祥物
        </h1>
        <p className="subtitle">AI合规官 · 10种情绪状态 · 可交互数字员工</p>
      </header>

      {/* 主内容区 */}
      <main className="app-main">
        {/* 左侧：吉祥物展示 */}
        <section className="mascot-section">
          <EMascot size="medium" />
          <p className="tip">
            💡 <strong>双击小E</strong> 吓它一跳 · <strong>长按小E</strong> 询问建议
          </p>
        </section>

        {/* 右侧：控制面板 */}
        <section className="control-section">
          <ControlPanel />
        </section>
      </main>
    </div>
  );
}

export default App;
