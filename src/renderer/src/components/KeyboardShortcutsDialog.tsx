interface KeyboardShortcutsDialogProps {
  onClose: () => void
}

const shortcuts = [
  { keys: 'Ctrl+N', action: 'New Report' },
  { keys: 'Ctrl+O', action: 'Open Report' },
  { keys: 'Ctrl+S', action: 'Save Report' },
  { keys: 'Ctrl+E', action: 'Export as PDF' },
  { keys: 'Ctrl+P', action: 'Print' },
  { keys: 'Ctrl+,', action: 'Settings' },
  { keys: 'Ctrl+Q', action: 'Quit' }
]

export function KeyboardShortcutsDialog({
  onClose
}: KeyboardShortcutsDialogProps): React.JSX.Element {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="dialog-window shortcuts-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="title-bar">
          <div className="title-bar-text">Keyboard Shortcuts</div>
          <div className="title-bar-controls">
            <button onClick={onClose} aria-label="Close"></button>
          </div>
        </div>
        <div className="window-body shortcuts-body">
          <table className="shortcuts-table">
            <thead>
              <tr>
                <th className="shortcuts-header-keys">Shortcut</th>
                <th className="shortcuts-header-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {shortcuts.map((shortcut, i) => (
                <tr key={i}>
                  <td className="shortcuts-keys">{shortcut.keys}</td>
                  <td className="shortcuts-action">{shortcut.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
