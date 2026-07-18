import type { Report, BobsResult } from '@shared/types'
import { VERDICT_LABELS } from '../report/verdictLabels'
import { AUTHOR_LABELS } from '../report/authorLabels'

interface BobsReviewScreenProps {
  report: Report
  review: BobsResult
  loading: boolean
  error: string | null
  onBack: () => void
  onClose: () => void
}

function BobsReviewScreen({
  report,
  review,
  loading,
  error,
  onBack,
  onClose
}: BobsReviewScreenProps): React.JSX.Element {
  if (loading) {
    return (
      <div className="window-body tps-body">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>The Bobs are reviewing your report...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="window-body tps-body">
        <div style={{ padding: '2rem' }}>
          <p className="save-error note">Review failed: {error}</p>
          <div className="editor-actions">
            <button type="button" onClick={onBack}>
              Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="window-body tps-body">
      <div style={{ padding: '1rem' }}>
        <h2 style={{ margin: '0 0 1rem 0' }}>The Bobs&apos; Review</h2>

        <div
          style={{
            marginBottom: '1rem',
            padding: '0.5rem',
            backgroundColor: '#e8e8e8',
            border: '1px solid #dfdfdf'
          }}
        >
          <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>Report: {report.id}</p>
          <p style={{ margin: 0, color: '#666' }}>Author: {AUTHOR_LABELS[report.author]}</p>
        </div>

        <fieldset style={{ marginBottom: '1rem' }}>
          <legend>Report Body</legend>
          <div
            style={{
              padding: '0.5rem',
              backgroundColor: '#fff',
              border: '1px solid #dfdfdf',
              maxHeight: '12rem',
              overflowY: 'auto'
            }}
          >
            <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              {report.body}
            </p>
          </div>
        </fieldset>

        <fieldset style={{ marginBottom: '1.5rem' }}>
          <legend>Critique</legend>
          <div style={{ padding: '0.5rem', backgroundColor: '#fff', border: '1px solid #dfdfdf' }}>
            <p style={{ margin: 0 }}>{review.critique}</p>
          </div>
        </fieldset>

        <fieldset style={{ marginBottom: '1.5rem' }}>
          <legend>Verdict</legend>
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fff',
              border: '1px solid #dfdfdf',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: getVerdictColor(review.verdict),
                color: '#fff',
                fontWeight: 'bold',
                borderRadius: '4px'
              }}
            >
              {VERDICT_LABELS[review.verdict]}
            </div>
          </div>
        </fieldset>

        <div className="editor-actions">
          <button type="button" onClick={onBack}>
            Back
          </button>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case 'ship_it':
      return '#2d5016'
    case 'circle_back':
      return '#805c1f'
    case 'basement':
      return '#8b0000'
    default:
      return '#666'
  }
}

export default BobsReviewScreen
