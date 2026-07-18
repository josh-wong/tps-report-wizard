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
            <img
              className="title-bar-icon"
              src={`${import.meta.env.BASE_URL}favicon-16.png`}
              alt=""
            />
            <div className="title-bar-text">About Initech TPS Report Wizard &apos;99</div>
          </div>
          <div className="title-bar-controls">
            <button onClick={onClose} aria-label="Close"></button>
          </div>
        </div>
        <div className="window-body">
          <div className="about-header">
            <img className="about-icon" src={`${import.meta.env.BASE_URL}app-icon-64.png`} alt="" />
            <p>
              <strong>Initech TPS Report Wizard &apos;99</strong>
            </p>
          </div>
          <p className="about-description">
            A retro-styled TPS report generator inspired by the 1999 film Office Space.
          </p>
          <p style={{ marginTop: '12px', marginBottom: '0' }}>
            <button
              onClick={openGitHub}
              style={{
                padding: '4px 12px',
                cursor: 'pointer',
                background: '#dfdfdf',
                border: '2px outset #dfdfdf',
                font: 'inherit',
                fontSize: '11px'
              }}
            >
              View on GitHub
            </button>
          </p>
        </div>
        <div className="dialog-actions">
          <button onClick={onClose} className="primary-button">
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
