import type { Report, Tone } from '@shared/types'
import { TONE_LABELS } from '../report/toneLabels'

interface ReportEditorScreenProps {
  report: Report
  generating: boolean
  onChange: (report: Report) => void
  onGenerate: () => void
  onSave: () => void
  onBack: () => void
}

// New/edit TPS Report form (FR-1..FR-4, FR-4a excluded here — that's the
// list screen). Seed is the input; body is the generated (and then
// editable) output — the two never blend into one field (FR-2b).
function ReportEditorScreen({
  report,
  generating,
  onChange,
  onGenerate,
  onSave,
  onBack
}: ReportEditorScreenProps): React.JSX.Element {
  const update = (patch: Partial<Report>): void => {
    onChange({ ...report, ...patch, updatedAt: Date.now() })
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

      <div className="editor-actions">
        <button type="button" onClick={onBack}>
          ← Back
        </button>
        <button type="button" onClick={onSave}>
          💾 Save
        </button>
      </div>
    </div>
  )
}

export default ReportEditorScreen
