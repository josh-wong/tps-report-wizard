interface CoverSheetGateDialogProps {
  onProceed: () => void
  onCancel: () => void
}

function CoverSheetGateDialog({ onProceed, onCancel }: CoverSheetGateDialogProps): React.JSX.Element {
  return (
    <div className="modal-overlay">
      <div className="window dialog-window">
        <div className="title-bar">
          <div className="title-bar-text">Cover Sheet Required</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onCancel}></button>
          </div>
        </div>
        <div className="window-body">
          <p>
            <strong>Yeeeah...</strong> if you could go ahead and attach that new cover sheet,
            that&apos;d be greeeat.
          </p>
          <p>Cover sheet required to proceed with this action.</p>
          <div className="dialog-actions">
            <button onClick={onCancel}>Cancel</button>
            <button onClick={onProceed} className="primary-button">
              Attach cover sheet &amp; continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoverSheetGateDialog
