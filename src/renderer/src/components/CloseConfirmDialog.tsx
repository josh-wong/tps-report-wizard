interface CloseConfirmDialogProps {
  onCloseAnyway: () => void
  onFinishIt: () => void
}

export function CloseConfirmDialog({
  onCloseAnyway,
  onFinishIt
}: CloseConfirmDialogProps): React.JSX.Element {
  return (
    <div className="modal-overlay" onClick={onFinishIt}>
      <div className="dialog-window" onClick={(e) => e.stopPropagation()}>
        <div className="title-bar">
          <div className="title-bar-text">TPS Report Wizard 99</div>
          <div className="title-bar-controls">
            <button onClick={onFinishIt} aria-label="Close"></button>
          </div>
        </div>
        <div className="window-body">
          <p>I&apos;m gonna need you to go ahead and finish that TPS report before you head out.</p>
          <p>That&apos;d be greeeat.</p>
        </div>
        <div className="dialog-actions close-confirm-actions">
          <button onClick={onCloseAnyway}>Close anyway</button>
          <button onClick={onFinishIt} className="primary-button">
            Finish it
          </button>
        </div>
      </div>
    </div>
  )
}
