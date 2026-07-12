import { useEffect, useState } from 'react'
import '98.css'
import './styles/initech.css'
import type { Report } from '@shared/types'
import { isDesktop } from './platform/isDesktop'
import { makeReportStore } from './store'
import { makeReportEngine } from './engine/makeReportEngine'
import { createDraftReport } from './report/createDraftReport'
import ReportListScreen from './screens/ReportListScreen'
import ReportEditorScreen from './screens/ReportEditorScreen'

const reportStore = makeReportStore()
const reportEngine = makeReportEngine()

function App(): React.JSX.Element {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [activeReport, setActiveReport] = useState<Report | null>(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    reportStore
      .list()
      .then(setReports)
      .finally(() => setLoading(false))
  }, [])

  const handleNew = (): void => {
    setActiveReport(createDraftReport(reports))
  }

  const handleOpen = (report: Report): void => {
    setActiveReport(report)
  }

  const handleGenerate = async (): Promise<void> => {
    if (!activeReport) return
    setGenerating(true)
    try {
      const body = await reportEngine.generate(activeReport.seed, activeReport.tone)
      setActiveReport((prev) => (prev ? { ...prev, body, updatedAt: Date.now() } : null))
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async (): Promise<void> => {
    if (!activeReport) return
    const report = { ...activeReport, status: 'filed' as const }
    try {
      await reportStore.save(report)
      setReports((prev) => {
        const i = prev.findIndex((r) => r.id === report.id)
        return i >= 0 ? [...prev.slice(0, i), report, ...prev.slice(i + 1)] : [...prev, report]
      })
      setActiveReport(null)
    } catch (err) {
      console.error('Failed to save report:', err)
    }
  }

  const handleBack = (): void => {
    setActiveReport(null)
  }

  return (
    <div className="window tps-window">
      <div className="title-bar">
        <div className="title-bar-text">
          {activeReport
            ? `📋 ${activeReport.status === 'draft' ? 'New TPS Report' : 'TPS Report'} — ${activeReport.id}`
            : "📋 Initech TPS Report Wizard '99"}
        </div>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close"></button>
        </div>
      </div>
      <div className="menu-bar">
        <span>
          <u>F</u>ile
        </span>
        <span>
          <u>E</u>dit
        </span>
        <span>
          <u>R</u>eports
        </span>
        <span>
          <u>F</u>lair
        </span>
        <span>
          <u>H</u>elp
        </span>
      </div>
      {activeReport ? (
        <ReportEditorScreen
          report={activeReport}
          generating={generating}
          onChange={setActiveReport}
          onGenerate={handleGenerate}
          onSave={handleSave}
          onBack={handleBack}
        />
      ) : (
        <ReportListScreen
          reports={reports}
          loading={loading}
          onNew={handleNew}
          onOpen={handleOpen}
        />
      )}
      <div className="status-bar">
        <p className="status-bar-field">
          {isDesktop ? 'AI: off — using the Nonsense Engine' : 'Web lite — Nonsense Engine only'}
        </p>
        <p className="status-bar-field">Y2K Compliant ✓</p>
      </div>
    </div>
  )
}

export default App
