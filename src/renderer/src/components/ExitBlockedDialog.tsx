interface ExitBlockedDialogProps {
  onClose: () => void
}

export function ExitBlockedDialog({ onClose }: ExitBlockedDialogProps): React.JSX.Element {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="dialog-window" onClick={(e) => e.stopPropagation()}>
        <div className="title-bar">
          <div className="title-bar-text">Initech TPS Report Wizard 99</div>
          <div className="title-bar-controls">
            <button onClick={onClose} aria-label="Close"></button>
          </div>
        </div>
        <div className="window-body">
          <p>
            Yeah, if you could just go ahead and close this tab yourself&mdash;that&apos;d be great.
          </p>
          <p>Browser security won&apos;t let me do it for you.</p>
        </div>
        <div className="dialog-actions about-actions">
          <button onClick={onClose} className="primary-button">
            OK
          </button>
        </div>
      </div>
    </div>
  )
}
