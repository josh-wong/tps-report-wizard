import { TitleBarIcon } from './TitleBarIcon'

interface AboutDialogProps {
  onClose: () => void
}

export function AboutDialog({ onClose }: AboutDialogProps): React.JSX.Element {
  const openGitHub = (): void => {
    window.open('https://github.com/josh-wong/tps-report-wizard', '_blank')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="dialog-window" onClick={(e) => e.stopPropagation()}>
        <div className="title-bar">
          <div className="title-bar-heading">
            <TitleBarIcon />
            <div className="title-bar-text">About Initech TPS Report Wizard &apos;99</div>
          </div>
          <div className="title-bar-controls">
            <button onClick={onClose} aria-label="Close"></button>
          </div>
        </div>
        <div className="window-body">
          <div className="about-header">
            <img className="about-icon" src={`${import.meta.env.BASE_URL}app-icon-64.png`} alt="" />
            <div className="about-text">
              <p>
                <strong>Initech TPS Report Wizard &apos;99</strong>
              </p>
              <p className="about-description">
                A retro-styled TPS report generator. Fan project inspired by the 1999 film Office Space.
              </p>
            </div>
          </div>
        </div>
        <div className="dialog-actions about-actions">
          <button onClick={openGitHub}>View on GitHub</button>
          <button onClick={onClose} className="primary-button">
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
