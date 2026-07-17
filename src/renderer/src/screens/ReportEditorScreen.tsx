import { useState } from 'react'
import type { Report, Author, Provider } from '@shared/types'
import { SELECTABLE_AUTHORS } from '@shared/types'
import { AUTHOR_LABELS } from '../report/authorLabels'
import { isDesktop } from '../platform/isDesktop'
import { estimateGenerationCost, formatCost } from '@shared/costEstimator'
import CoverSheetGateDialog from '../components/CoverSheetGateDialog'
import PrintPreviewModal from '../components/PrintPreviewModal'

interface ReportEditorScreenProps {
  report: Report
  provider: Provider | null
  generating: boolean
  generateError: string | null
  saveError: string | null
  onChange: (report: Report) => void
  onGenerate: () => void
  onSave: () => void
  onBack: () => void
  onReview?: () => void
  reviewing?: boolean
}

function ReportEditorScreen({
  report,
  provider,
  generating,
  generateError,
  saveError,
  onChange,
  onGenerate,
  onSave,
  onBack,
  onReview,
  reviewing
}: ReportEditorScreenProps): React.JSX.Element {
  const [showGate, setShowGate] = useState(false)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<'print' | 'export' | 'review' | null>(null)

  const update = (patch: Partial<Report>): void => {
    onChange({ ...report, ...patch, updatedAt: Date.now() })
  }

  const handleAttachCoverSheet = (): void => {
    update({ coverSheet: true })
    setShowGate(false)
    if (pendingAction === 'print') {
      setShowPrintPreview(true)
    } else if (pendingAction === 'export') {
      doExportPdf({ ...report, coverSheet: true })
    } else if (pendingAction === 'review' && onReview) {
      onReview()
    }
    setPendingAction(null)
  }

  const handlePrint = (): void => {
    if (!report.coverSheet) {
      setShowGate(true)
      setPendingAction('print')
      return
    }
    setShowPrintPreview(true)
  }

  const doExportPdf = async (effectiveReport: typeof report): Promise<void> => {
    setExporting(true)
    setExportError(null)
    let canceled = false
    try {
      if (isDesktop && window.electronAPI) {
        const result = await window.electronAPI.exportPdf(effectiveReport)
        if (result === null) canceled = true
      } else {
        window.print()
      }
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed')
      canceled = true
    } finally {
      setExporting(false)
      if (!canceled) setShowPrintPreview(false)
    }
  }

  const handleExportPdf = (): void => {
    if (!report.coverSheet) {
      setShowGate(true)
      setPendingAction('export')
      return
    }
    doExportPdf(report)
  }

  const handleSendToBobs = (): void => {
    if (!report.coverSheet) {
      setShowGate(true)
      setPendingAction('review')
      return
    }
    onReview?.()
  }

  return (
    <div className="window-body tps-body">
      {!report.coverSheet && (
        <div className="memo-banner">
          💬 Yeeeah&hellip; if you could go ahead and re-attach that new cover sheet, that&apos;d be
          greeeat. — B. Lumbergh
        </div>
      )}

      <div className="tps-field-grid">
        <label htmlFor="report-id">Report ID</label>
        <div id="report-id" className="sunken-panel report-id-field">
          {report.id}
        </div>

        <label htmlFor="author">Author</label>
        <select
          id="author"
          value={report.author}
          onChange={(e) => update({ author: e.target.value as Author, body: '' })}
        >
          {SELECTABLE_AUTHORS.map((value) => (
            <option key={value} value={value}>
              {AUTHOR_LABELS[value]}
            </option>
          ))}
        </select>

        <label htmlFor="department">Department</label>
        <input
          id="department"
          type="text"
          value={report.department}
          onChange={(e) => update({ department: e.target.value })}
        />

        <label htmlFor="date">Date</label>
        <input
          id="date"
          type="text"
          value={report.date}
          onChange={(e) => update({ date: e.target.value })}
        />
      </div>

      <div className="field-row-stacked">
        <label htmlFor="seed">
          Describe what happened (we&apos;ll write the rest) —{' '}
          <span className="note">your input</span>
        </label>
        <div className="seed-row">
          <input
            id="seed"
            type="text"
            placeholder="the printer jammed again"
            value={report.seed}
            onChange={(e) => update({ seed: e.target.value })}
          />
          <button type="button" onClick={onGenerate} disabled={generating}>
            {generating ? 'Generating…' : '✨ Generate'}
          </button>
        </div>
        {provider && report.seed.trim() && (
          <span className="note">
            Estimated cost:{' '}
            {formatCost(estimateGenerationCost(report.seed, report.author, provider))} (actual may
            vary)
          </span>
        )}
      </div>

      <div className="field-row-stacked">
        <label htmlFor="body">
          Report body — <span className="note">generated output, editable</span>
        </label>
        <textarea
          id="body"
          rows={7}
          value={report.body}
          onChange={(e) => update({ body: e.target.value })}
        />
      </div>

      <div className="editor-footer">
        <div className="cover-sheet-toggle field-row">
          <input
            id="cover-sheet"
            type="checkbox"
            checked={report.coverSheet}
            onChange={(e) => update({ coverSheet: e.target.checked })}
          />
          <label htmlFor="cover-sheet">
            Attach new cover sheet <span className="note">(you got the memo)</span>
          </label>
        </div>
      </div>

      {generateError && <p className="save-error note">Generate failed: {generateError}</p>}
      {saveError && <p className="save-error note">{saveError}</p>}

      <div className="editor-actions">
        <button type="button" accessKey="b" onClick={onBack}>
          <u>B</u>ack
        </button>
        <button type="button" accessKey="p" onClick={handlePrint}>
          <u>P</u>rint
        </button>
        <button type="button" accessKey="e" onClick={handleExportPdf} disabled={exporting}>
          {exporting ? (
            'Exporting...'
          ) : (
            <>
              <u>E</u>xport PDF
            </>
          )}
        </button>
        {onReview && (
          <button type="button" onClick={handleSendToBobs} disabled={reviewing || !report.body}>
            {reviewing ? 'Reviewing...' : 'Send to Bobs'}
          </button>
        )}
        <button type="button" accessKey="s" onClick={onSave}>
          <u>S</u>ave
        </button>
      </div>

      {showGate && (
        <CoverSheetGateDialog
          onProceed={handleAttachCoverSheet}
          onCancel={() => {
            setShowGate(false)
            setPendingAction(null)
          }}
        />
      )}

      {showPrintPreview && (
        <PrintPreviewModal
          report={report}
          onClose={() => setShowPrintPreview(false)}
          onPrint={() => {
            setShowPrintPreview(false)
            window.print()
          }}
          onExport={() => doExportPdf(report)}
          exporting={exporting}
          exportError={exportError}
        />
      )}
    </div>
  )
}

export default ReportEditorScreen
