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

type Screen = 'list' | 'editor'

function App(): React.JSX.Element {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [screen, setScreen] = useState<Screen>('list')
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
    setScreen('editor')
  }

  const handleOpen = (report: Report): void => {
    setActiveReport(report)
    setScreen('editor')
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
    await reportStore.save(report)
    setReports(await reportStore.list())
    setActiveReport(null)
    setScreen('list')
  }

  const handleBack = (): void => {
    setActiveReport(null)
    setScreen('list')
  }

  return (
    <div className="window tps-window">
      <div className="title-bar">
        <div className="title-bar-text">
          {screen === 'editor' && activeReport
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
      {screen === 'editor' && activeReport ? (
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
