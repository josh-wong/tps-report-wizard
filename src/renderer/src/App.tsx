import { useEffect, useMemo, useState } from 'react'
import '98.css'
import './styles/initech.css'
import type { Provider, Report } from '@shared/types'
import { isDesktop } from './platform/isDesktop'
import { makeReportStore } from './store'
import { makeReportEngine } from './engine/makeReportEngine'
import { createDraftReport } from './report/createDraftReport'
import ReportListScreen from './screens/ReportListScreen'
import ReportEditorScreen from './screens/ReportEditorScreen'
import SettingsScreen from './screens/SettingsScreen'

type Screen = 'list' | 'editor' | 'settings'

const reportStore = makeReportStore()

function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('list')
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [activeReport, setActiveReport] = useState<Report | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  const [providerStatus, setProviderStatus] = useState<{
    provider: Provider | null
    hasKey: boolean
  }>({ provider: null, hasKey: false })

  useEffect(() => {
    reportStore
      .list()
      .then(setReports)
      .catch((err) => console.error('Failed to load reports:', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!isDesktop) return
    window.electronAPI
      .getProviderStatus()
      .then(setProviderStatus)
      .catch((err) => console.error('Failed to get provider status:', err))
  }, [])

  const reportEngine = useMemo(
    () => makeReportEngine(providerStatus.hasKey),
    [providerStatus.hasKey]
  )

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
    setGenerateError(null)
    try {
      const body = await reportEngine.generate(activeReport.seed, activeReport.tone)
      setActiveReport((prev) => (prev ? { ...prev, body, updatedAt: Date.now() } : null))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed.'
      setGenerateError(msg)
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async (): Promise<void> => {
    if (!activeReport) return
    const report = { ...activeReport, status: 'filed' as const }
    setSaveError(null)
    try {
      await reportStore.save(report)
      setReports((prev) => {
        const i = prev.findIndex((r) => r.id === report.id)
        return i >= 0 ? [...prev.slice(0, i), report, ...prev.slice(i + 1)] : [...prev, report]
      })
      setActiveReport(null)
      setScreen('list')
    } catch (err) {
      console.error('Failed to save report:', err)
      setSaveError('Save failed. Please try again.')
    }
  }

  const handleBack = (): void => {
    setActiveReport(null)
    setScreen('list')
  }

  const handleSettingsStatusChange = (provider: Provider | null, hasKey: boolean): void => {
    setProviderStatus({ provider, hasKey })
  }

  const aiStatusLabel = (): string => {
    if (!isDesktop) return 'Web lite — Nonsense Engine only'
    if (providerStatus.hasKey && providerStatus.provider) {
      return `AI: ${providerStatus.provider === 'claude' ? 'Claude' : 'OpenAI'} — ready`
    }
    return 'AI: off — using the Nonsense Engine'
  }

  return (
    <div className="window tps-window">
      <div className="title-bar">
        <div className="title-bar-text">
          {screen === 'settings'
            ? '⚙ Settings — AI Provider'
            : activeReport
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
        {isDesktop && (
          <span
            onClick={() =>
              setScreen(screen === 'settings' ? (activeReport ? 'editor' : 'list') : 'settings')
            }
          >
            <u>T</u>ools
          </span>
        )}
        <span>
          <u>H</u>elp
        </span>
      </div>

      {screen === 'settings' && isDesktop ? (
        <SettingsScreen
          initialProvider={providerStatus.provider}
          initialHasKey={providerStatus.hasKey}
          onClose={() => setScreen(activeReport ? 'editor' : 'list')}
          onStatusChange={handleSettingsStatusChange}
        />
      ) : screen === 'editor' && activeReport ? (
        <ReportEditorScreen
          report={activeReport}
          provider={providerStatus.provider}
          generating={generating}
          generateError={generateError}
          saveError={saveError}
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
        <p className="status-bar-field">{aiStatusLabel()}</p>
        <p className="status-bar-field">Y2K Compliant ✓</p>
      </div>
    </div>
  )
}

export default App
