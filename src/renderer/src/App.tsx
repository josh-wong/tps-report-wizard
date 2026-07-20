import { useEffect, useMemo, useRef, useState } from 'react'
import '98.css'
import './styles/initech.css'
import type { Provider, Report, BobsResult } from '@shared/types'
import { isDesktop } from './platform/isDesktop'
import { makeReportStore } from './store'
import { makeReportEngine } from './engine/makeReportEngine'
import { createDraftReport } from './report/createDraftReport'
import ReportListScreen from './screens/ReportListScreen'
import ReportEditorScreen from './screens/ReportEditorScreen'
import SettingsScreen from './screens/SettingsScreen'
import BobsReviewScreen from './screens/BobsReviewScreen'
import { MenuBar } from './components/MenuBar'
import { AboutDialog } from './components/AboutDialog'
import { TitleBarIcon } from './components/TitleBarIcon'
import { KeyboardShortcutsDialog } from './components/KeyboardShortcutsDialog'
import { CloseConfirmDialog } from './components/CloseConfirmDialog'
import { ExitBlockedDialog } from './components/ExitBlockedDialog'
import { ChromeBlockedDialog } from './components/ChromeBlockedDialog'

type Screen = 'list' | 'editor' | 'settings' | 'bobs-review'

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
    savedProviders: Provider[]
  }>({ provider: null, hasKey: false, savedProviders: [] })

  const [bobsReview, setBobsReview] = useState<BobsResult | null>(null)
  const [reviewing, setReviewing] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [showAbout, setShowAbout] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [showExitBlocked, setShowExitBlocked] = useState(false)
  const [showChromeBlocked, setShowChromeBlocked] = useState(false)
  const exitBlockedTimeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      window.clearTimeout(exitBlockedTimeoutRef.current)
    }
  }, [])

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

  useEffect(() => {
    if (!isDesktop) return
    window.electronAPI.setDraftPresent(activeReport?.status === 'draft')
    void window.menuAPI.updateMenuState({
      hasActiveReport: !!activeReport,
      isEditing: screen === 'editor',
      hasReports: reports.length > 0
    })
  }, [activeReport, screen, reports.length])

  useEffect(() => {
    if (!isDesktop) return
    const ping = (): void => window.electronAPI.activityPing()
    window.addEventListener('mousemove', ping)
    window.addEventListener('keydown', ping)
    window.addEventListener('click', ping)
    return () => {
      window.removeEventListener('mousemove', ping)
      window.removeEventListener('keydown', ping)
      window.removeEventListener('click', ping)
    }
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
      const body = await reportEngine.generate(activeReport.seed, activeReport.author)
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

  const handleReview = async (): Promise<void> => {
    if (!activeReport) return
    setReviewing(true)
    setReviewError(null)
    try {
      const review = await reportEngine.review(activeReport)
      setBobsReview(review)
      setScreen('bobs-review')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Review failed.'
      setReviewError(msg)
    } finally {
      setReviewing(false)
    }
  }

  const handleExit = (): void => {
    // window.close() is a no-op when the browser blocks it (tab wasn't opened via script),
    // so on web we always surface the fallback dialog rather than trying to detect success.
    window.close()
    if (!isDesktop) {
      exitBlockedTimeoutRef.current = window.setTimeout(() => setShowExitBlocked(true), 150)
    }
  }

  const handleSettingsStatusChange = (
    provider: Provider | null,
    hasKey: boolean,
    savedProviders?: Provider[]
  ): void => {
    setProviderStatus((prev) => ({
      provider,
      hasKey,
      savedProviders: savedProviders ?? prev.savedProviders
    }))
  }

  const aiStatusLabel = (): string => {
    if (!isDesktop) return 'Web lite – Nonsense Engine only'
    if (providerStatus.hasKey && providerStatus.provider) {
      return `AI: ${providerStatus.provider === 'claude' ? 'Claude' : 'OpenAI'} – Ready`
    }
    return 'AI: Off – Using the Nonsense Engine'
  }

  useEffect(() => {
    if (!isDesktop) return
    const unsubscribe: (() => void)[] = []

    unsubscribe.push(window.menuAPI.onNewReport(handleNew))
    unsubscribe.push(
      window.menuAPI.onOpenReport(() => {
        setScreen('list')
      })
    )
    unsubscribe.push(window.menuAPI.onSaveReport(handleSave))
    unsubscribe.push(
      window.menuAPI.onExportPdf(async () => {
        if (!activeReport) return
        try {
          await window.electronAPI.exportPdf(activeReport)
        } catch (err) {
          console.error('Export failed:', err)
        }
      })
    )
    unsubscribe.push(
      window.menuAPI.onPrint(() => {
        window.print()
      })
    )
    unsubscribe.push(
      window.menuAPI.onSettings(() => {
        setScreen(screen === 'settings' ? (activeReport ? 'editor' : 'list') : 'settings')
      })
    )
    unsubscribe.push(
      window.menuAPI.onAbout(() => {
        alert(
          'TPS Report Wizard 99\n\nA retro-styled report generator. Fan project inspired by Office Space.'
        )
      })
    )
    unsubscribe.push(
      window.menuAPI.onKeyboardShortcuts(() => {
        const shortcuts = `Keyboard shortcuts:
Ctrl+N (Cmd+N)    - New report
Ctrl+O (Cmd+O)    - Open report
Ctrl+S (Cmd+S)    - Save report
Ctrl+E (Cmd+E)    - Export as PDF
Ctrl+P (Cmd+P)    - Print
Ctrl+, (Cmd+,)    - Settings
Ctrl+Q (Cmd+Q)    - Quit`
        alert(shortcuts)
      })
    )
    unsubscribe.push(
      window.menuAPI.onRecentReports(() => {
        setScreen('list')
      })
    )
    unsubscribe.push(
      window.menuAPI.onConfirmCloseRequest(() => {
        setShowCloseConfirm(true)
      })
    )

    return () => {
      unsubscribe.forEach((fn) => fn())
    }
  }, [activeReport, screen, handleNew, handleSave])

  return (
    <div className="window tps-window">
      <div className="title-bar">
        <div className="title-bar-heading">
          <TitleBarIcon />
          <div className="title-bar-text">
            {screen === 'settings'
              ? 'Settings – AI Provider'
              : activeReport
                ? `${activeReport.status === 'draft' ? 'New TPS report' : 'TPS report'} – ${activeReport.id}`
                : 'TPS Report Wizard 99'}
          </div>
        </div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={() => setShowChromeBlocked(true)}></button>
          <button aria-label="Maximize" onClick={() => setShowChromeBlocked(true)}></button>
          <button aria-label="Close" onClick={() => setShowChromeBlocked(true)}></button>
        </div>
      </div>
      <MenuBar
        onNewReport={handleNew}
        onOpenReport={() => setScreen('list')}
        onOpenReportById={(id) => {
          const report = reports.find((r) => r.id === id)
          if (report) {
            handleOpen(report)
          }
        }}
        onSaveReport={handleSave}
        onExportPdf={async () => {
          if (!activeReport) return
          try {
            await window.electronAPI.exportPdf(activeReport)
          } catch (err) {
            console.error('Export failed:', err)
          }
        }}
        onPrint={() => window.print()}
        onSettings={() =>
          setScreen(screen === 'settings' ? (activeReport ? 'editor' : 'list') : 'settings')
        }
        onAbout={() => setShowAbout(true)}
        onKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
        onExit={handleExit}
        activeReport={activeReport}
        isEditing={screen === 'editor'}
        hasReports={reports.length > 0}
        reports={reports}
        isDesktop={isDesktop}
      />

      {screen === 'settings' && isDesktop ? (
        <SettingsScreen
          initialProvider={providerStatus.provider}
          initialHasKey={providerStatus.hasKey}
          initialSavedProviders={providerStatus.savedProviders}
          onClose={() => setScreen(activeReport ? 'editor' : 'list')}
          onStatusChange={handleSettingsStatusChange}
        />
      ) : screen === 'bobs-review' && activeReport && bobsReview ? (
        <BobsReviewScreen
          report={activeReport}
          review={bobsReview}
          loading={reviewing}
          error={reviewError}
          onBack={() => setScreen('editor')}
          onClose={() => {
            setBobsReview(null)
            setScreen('list')
          }}
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
          onReview={handleReview}
          reviewing={reviewing}
        />
      ) : (
        <ReportListScreen
          reports={reports}
          loading={loading}
          onNew={handleNew}
          onOpen={handleOpen}
        />
      )}

      {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}
      {showKeyboardShortcuts && (
        <KeyboardShortcutsDialog
          onClose={() => setShowKeyboardShortcuts(false)}
          isDesktop={isDesktop}
        />
      )}
      {showCloseConfirm && (
        <CloseConfirmDialog
          onCloseAnyway={() => {
            setShowCloseConfirm(false)
            window.menuAPI.sendConfirmCloseResponse(true)
          }}
          onFinishIt={() => {
            setShowCloseConfirm(false)
            window.menuAPI.sendConfirmCloseResponse(false)
          }}
        />
      )}
      {showExitBlocked && <ExitBlockedDialog onClose={() => setShowExitBlocked(false)} />}
      {showChromeBlocked && <ChromeBlockedDialog onClose={() => setShowChromeBlocked(false)} />}

      <div className="status-bar">
        <p className="status-bar-field">{aiStatusLabel()}</p>
        <p className="status-bar-field">Y2K compliant ✓</p>
      </div>
    </div>
  )
}

export default App
