interface DeleteKeyConfirmDialogProps {
  providerLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteKeyConfirmDialog({
  providerLabel,
  onConfirm,
  onCancel
}: DeleteKeyConfirmDialogProps): React.JSX.Element {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="dialog-window" onClick={(e) => e.stopPropagation()}>
        <div className="title-bar">
          <div className="title-bar-text">TPS Report Wizard 99</div>
          <div className="title-bar-controls">
            <button onClick={onCancel} aria-label="Close"></button>
          </div>
        </div>
        <div className="window-body">
          <p>Delete the {providerLabel} API key?</p>
        </div>
        <div className="dialog-actions delete-key-confirm-actions">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm} className="primary-button">
            Delete key
          </button>
        </div>
      </div>
    </div>
  )
}
