interface ChromeBlockedDialogProps {
  onClose: () => void
}

export function ChromeBlockedDialog({ onClose }: ChromeBlockedDialogProps): React.JSX.Element {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="dialog-window" onClick={(e) => e.stopPropagation()}>
        <div className="title-bar">
          <div className="title-bar-text">TPS Report Wizard 99</div>
          <div className="title-bar-controls">
            <button onClick={onClose} aria-label="Close"></button>
          </div>
        </div>
        <div className="window-body">
          <p>
            Yeeeah, if you could just go ahead and not minimize, maximize, or close this
            window&mdash;that&apos;d be greeeat.
          </p>
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
