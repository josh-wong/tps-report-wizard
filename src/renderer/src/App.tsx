import '98.css'
import './styles/initech.css'
import { isDesktop } from './platform/isDesktop'

function App(): React.JSX.Element {
  return (
    <div className="window tps-window">
      <div className="title-bar">
        <div className="title-bar-text">📋 Initech TPS Report Wizard &apos;99</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close"></button>
        </div>
      </div>
      <div className="menu-bar">
        <span>
          <u>F</u>ile
        </span>
        <span>
          <u>E</u>dit
        </span>
        <span>
          <u>R</u>eports
        </span>
        <span>
          <u>F</u>lair
        </span>
        <span>
          <u>H</u>elp
        </span>
      </div>
      <div className="window-body tps-body">
        <p>Y2K remediation is complete. The New TPS Report workflow lands in the next phase.</p>
        <p className="note">Running in {isDesktop ? 'desktop' : 'web lite'} mode.</p>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">
          {isDesktop ? 'AI: off — using the Nonsense Engine' : 'Web lite — Nonsense Engine only'}
        </p>
        <p className="status-bar-field">Y2K Compliant ✓</p>
      </div>
    </div>
  )
}

export default App
