import type { Report } from '@shared/types'
import { TONE_LABELS } from '../report/toneLabels'

interface ReportListScreenProps {
  reports: Report[]
  loading: boolean
  onNew: () => void
  onOpen: (report: Report) => void
}

// Empty state + report list (FR-4a, FR-26). The sample library (seeded by
// the store on first run) and any user-saved reports show in the same
// grid, so a first-run user can open, read, and share a report with zero
// setup and no key — and the same screen doubles as "reopen a saved report."
function ReportListScreen({
  reports,
  loading,
  onNew,
  onOpen
}: ReportListScreenProps): React.JSX.Element {
  const isEmpty = !loading && reports.length === 0

  return (
    <div className="window-body tps-body">
      <div className="empty-state">
        {isEmpty ? (
          <>
            <div className="empty-icon">📁</div>
            <p className="empty-title">No reports yet. Did you get the memo?</p>
            <p className="note">Start a new report, or open one of these field-tested classics.</p>
          </>
        ) : (
          <p className="note">
            {loading ? 'Loading…' : 'Open a report to keep editing it, or start a new one.'}
          </p>
        )}
        <button type="button" onClick={onNew}>
          + New TPS Report
        </button>
      </div>

      <fieldset>
        <legend>Reports</legend>
        {reports.length === 0 ? (
          <p className="note">
            {loading ? 'Loading…' : "Nothing filed yet. That's about to change."}
          </p>
        ) : (
          <div className="report-grid">
            {reports.map((report) => (
              <button
                key={report.id}
                type="button"
                className="report-card sunken-panel"
                onClick={() => onOpen(report)}
              >
                <span className="report-card-title">{report.seed || report.id}</span>
                <span className="report-card-meta">
                  {report.id} · {TONE_LABELS[report.tone]} · {report.status}
                </span>
              </button>
            ))}
          </div>
        )}
      </fieldset>
    </div>
  )
}

export default ReportListScreen
