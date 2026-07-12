import { useState } from 'react'
import type { Report, Tone } from '@shared/types'
import { TONE_LABELS } from '../report/toneLabels'
import { isDesktop } from '../platform/isDesktop'
import CoverSheetGateDialog from '../components/CoverSheetGateDialog'
import PrintPreviewModal from '../components/PrintPreviewModal'

interface ReportEditorScreenProps {
  report: Report
  generating: boolean
  saveError: string | null
  onChange: (report: Report) => void
  onGenerate: () => void
  onSave: () => void
  onBack: () => void
}

function ReportEditorScreen({
  report,
  generating,
  saveError,
  onChange,
  onGenerate,
  onSave,
  onBack
}: ReportEditorScreenProps): React.JSX.Element {
  const [showGate, setShowGate] = useState(false)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<'print' | 'export' | null>(null)

  const update = (patch: Partial<Report>): void => {
    onChange({ ...report, ...patch, updatedAt: Date.now() })
  }

  const handleAttachCoverSheet = (): void => {
    update({ coverSheet: true })
    setShowGate(false)
    setPendingAction(null)
    if (pendingAction === 'print') {
      setShowPrintPreview(true)
    } else if (pendingAction === 'export') {
      doExportPdf({ ...report, coverSheet: true })
    }
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
        <input
          id="author"
          type="text"
          value={report.author}
          onChange={(e) => update({ author: e.target.value })}
        />

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
        <label className="field-row tone-select">
          Tone
          <select value={report.tone} onChange={(e) => update({ tone: e.target.value as Tone })}>
            {(Object.entries(TONE_LABELS) as [Tone, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {saveError && <p className="save-error note">{saveError}</p>}

      <div className="editor-actions">
        <button type="button" accessKey="b" onClick={onBack}>
          <u>B</u>ack
        </button>
        <button type="button" accessKey="p" onClick={handlePrint}>
          <u>P</u>rint
        </button>
        <button type="button" accessKey="e" onClick={handleExportPdf} disabled={exporting}>
          {exporting ? 'Exporting...' : <><u>E</u>xport PDF</>}
        </button>
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
