import type { Report } from '@shared/types'
import { AUTHOR_LABELS } from '@shared/authorLabels'

interface PrintPreviewModalProps {
  report: Report
  onClose: () => void
  onPrint: () => void
  onExport: () => void
  exporting: boolean
  exportError?: string | null
}

function PrintPreviewModal({
  report,
  onClose,
  onPrint,
  onExport,
  exporting,
  exportError
}: PrintPreviewModalProps): React.JSX.Element {
  return (
    <div className="modal-overlay">
      <div className="window print-preview-window">
        <div className="title-bar">
          <div className="title-bar-text">Print preview – {report.id}</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onClose}></button>
          </div>
        </div>
        <div className="print-preview-content">
          {report.coverSheet && (
            <div className="print-page cover-sheet-page">
              <div className="cover-sheet-content">
                <div className="cover-sheet-logo">INITECH</div>
                <div className="cover-sheet-title">T P S &nbsp; R E P O R T</div>
                <div className="cover-sheet-memo">
                  <p>
                    <strong>TO:</strong> All staff
                  </p>
                  <p>
                    <strong>FROM:</strong> {AUTHOR_LABELS[report.author]}
                  </p>
                  <p>
                    <strong>DATE:</strong> {report.date || '[Date]'}
                  </p>
                  <p>
                    <strong>RE:</strong> TPS report #{report.id}
                  </p>
                </div>
                <div className="cover-sheet-memo-text">
                  <p>
                    <em>
                      Did you get the memo? This is to confirm you have received and attached the
                      new cover sheet for your TPS report. Please ensure this cover sheet is
                      included with all future submissions.
                    </em>
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="print-page report-page">
            <div className="report-header">
              <div className="report-title">TPS report</div>
              <div className="report-meta">
                <div>
                  <strong>ID:</strong> {report.id}
                </div>
                <div>
                  <strong>Author:</strong> {AUTHOR_LABELS[report.author]}
                </div>
                <div>
                  <strong>Department:</strong> {report.department}
                </div>
                <div>
                  <strong>Date:</strong> {report.date}
                </div>
              </div>
            </div>
            <div className="report-body">{report.body}</div>
          </div>
        </div>
        <div className="print-preview-actions">
          {exportError && <p className="save-error note">{exportError}</p>}
          <button onClick={onClose} accessKey="c">
            <u>C</u>lose
          </button>
          <button onClick={onPrint} accessKey="p">
            <u>P</u>rint
          </button>
          <button onClick={onExport} disabled={exporting} className="primary-button" accessKey="e">
            {exporting ? (
              'PC LOAD LETTER...'
            ) : (
              <>
                <u>E</u>xport PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PrintPreviewModal
