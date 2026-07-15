import { writeFile } from 'fs/promises'
import { ipcMain, BrowserWindow, dialog } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc'
import type { GenerateRequest, BobsRequest } from '@shared/ipc'
import type { ReportStore } from '@shared/store'
import type {
  Provider,
  ProviderConfig,
  Report,
  Author,
  ReportStatus,
  BobsResult,
  Verdict
} from '@shared/types'
import { AUTHORS, REPORT_STATUSES } from '@shared/types'
import { buildSystemPrompt, buildBobsReviewSystem } from '@shared/authorPrompts'
import { pickReviewer } from '@shared/reviewer'
import { rollVerdict } from '@shared/verdict'
import { renderReportHtml } from './pdf/renderReportHtml'
import type { KeyStore } from './keyStore'
import { providerFactory } from './providers/factory'
import { humanizeError } from './providers/errors'

const VALID_AUTHORS = new Set(AUTHORS)
const VALID_STATUSES = new Set(REPORT_STATUSES)
const VALID_PROVIDERS = new Set<Provider>(['claude', 'openai'])

export function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0
}

export function isValidReport(r: unknown): r is Report {
  if (!r || typeof r !== 'object') return false
  const { id, author, department, date, seed, body, coverSheet, status, createdAt, updatedAt } =
    r as Record<string, unknown>
  return (
    isValidId(id) &&
    VALID_AUTHORS.has(author as Author) &&
    typeof department === 'string' &&
    typeof date === 'string' &&
    typeof seed === 'string' &&
    typeof body === 'string' &&
    typeof coverSheet === 'boolean' &&
    VALID_STATUSES.has(status as ReportStatus) &&
    typeof createdAt === 'number' &&
    typeof updatedAt === 'number'
  )
}

export function isValidGenerateRequest(r: unknown): r is GenerateRequest {
  if (!r || typeof r !== 'object') return false
  const { seed, author } = r as Record<string, unknown>
  return typeof seed === 'string' && seed.length > 0 && VALID_AUTHORS.has(author as Author)
}

export function isValidBobsRequest(r: unknown): r is BobsRequest {
  if (!r || typeof r !== 'object') return false
  const { report } = r as Record<string, unknown>
  return isValidReport(report)
}

export function isValidProviderConfig(p: unknown): p is ProviderConfig {
  if (!p || typeof p !== 'object') return false
  const { provider } = p as Record<string, unknown>
  return VALID_PROVIDERS.has(provider as Provider)
}

export interface NagIpcHooks {
  getQuietMode(): boolean
  setQuietMode(enabled: boolean): void
  onActivityPing(): void
  onReportSaved(report: Report): void
}

export function registerReportIpcHandlers(
  store: ReportStore,
  keyStore: KeyStore,
  nag: NagIpcHooks
): void {
  ipcMain.handle(IPC_CHANNELS.generate, async (_event, req: unknown) => {
    if (!isValidGenerateRequest(req)) throw new Error('Invalid generate request')
    const { seed, author } = req

    try {
      const status = keyStore.getStatus()
      if (!status.hasKey || !status.provider) {
        throw new Error('NO_AI_KEY')
      }

      const key = keyStore.getKey(status.provider)
      if (!key) throw new Error('NO_AI_KEY')

      const provider = providerFactory({ provider: status.provider }, key)
      const system = buildSystemPrompt(author)

      const body = await provider.complete({ system, user: seed })
      return { body }
    } catch (err) {
      throw new Error(humanizeError(err))
    }
  })

  ipcMain.handle(IPC_CHANNELS.testConnection, async (_event, p: unknown, candidateKey: unknown) => {
    if (!isValidProviderConfig(p)) return { ok: false, message: 'Invalid provider config.' }

    try {
      // Prefer the unsaved candidate key passed from the UI so the user can
      // test before committing. Fall back to the stored key if none was sent.
      const key =
        typeof candidateKey === 'string' && candidateKey.trim().length > 0
          ? candidateKey.trim()
          : keyStore.getKey(p.provider)

      if (!key) return { ok: false, message: 'No key saved for this provider yet.' }

      const provider = providerFactory(p, key)
      return await provider.test()
    } catch (err) {
      return { ok: false, message: humanizeError(err) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.reviewWithBobs, async (_event, req: unknown) => {
    if (!isValidBobsRequest(req)) throw new Error('Invalid Bobs request')
    const { report } = req

    try {
      const status = keyStore.getStatus()
      if (!status.hasKey || !status.provider) {
        return getBobsZingerResponse()
      }

      const key = keyStore.getKey(status.provider)
      if (!key) return getBobsZingerResponse()

      const provider = providerFactory({ provider: status.provider }, key)
      const reviewer = pickReviewer(report.author)

      const userPrompt = `Here is a TPS report to review:\n\n${report.body}`
      const result = await provider.complete({
        system: buildBobsReviewSystem(reviewer),
        user: userPrompt
      })

      return parseBobsResponse(result)
    } catch (err) {
      throw new Error(humanizeError(err))
    }
  })

  ipcMain.handle(IPC_CHANNELS.saveKey, (_event, p: unknown, key: unknown) => {
    if (!isValidProviderConfig(p)) throw new Error('Invalid provider config')
    if (typeof key !== 'string' || key.trim().length === 0) throw new Error('Invalid key')
    keyStore.saveKey(p.provider, key.trim())
    keyStore.setProvider(p.provider)
    keyStore.setEnabled(true)
  })

  ipcMain.handle(IPC_CHANNELS.deleteKeys, (_event, p: unknown) => {
    if (!isValidProviderConfig(p)) throw new Error('Invalid provider config')
    return keyStore.deleteKey(p.provider)
  })

  ipcMain.handle(IPC_CHANNELS.setEngineEnabled, (_event, enabled: unknown) => {
    if (typeof enabled !== 'boolean') throw new Error('Invalid enabled flag')
    keyStore.setEnabled(enabled)
  })

  ipcMain.handle(IPC_CHANNELS.getProviderStatus, () => keyStore.getStatus())

  ipcMain.handle(IPC_CHANNELS.listReports, () => store.list())
  ipcMain.handle(IPC_CHANNELS.getReport, (_event, id: unknown) =>
    isValidId(id) ? store.get(id) : null
  )
  ipcMain.handle(IPC_CHANNELS.saveReport, async (_event, report: unknown) => {
    if (!isValidReport(report)) throw new Error('Invalid report payload')
    await store.save(report)
    if (report.status === 'filed') nag.onReportSaved(report)
  })
  ipcMain.handle(IPC_CHANNELS.removeReport, (_event, id: unknown) => {
    if (!isValidId(id)) throw new Error('Invalid report id')
    return store.remove(id)
  })
  ipcMain.handle(IPC_CHANNELS.exportPdf, async (_event, report: unknown) => {
    if (!isValidReport(report)) throw new Error('Invalid report payload')
    return exportReportPdf(report as Report)
  })

  ipcMain.handle(IPC_CHANNELS.getQuietMode, () => nag.getQuietMode())
  ipcMain.handle(IPC_CHANNELS.setQuietMode, (_event, enabled: unknown) => {
    if (typeof enabled !== 'boolean') throw new Error('Invalid quiet mode flag')
    nag.setQuietMode(enabled)
  })
  ipcMain.on(IPC_CHANNELS.activityPing, () => nag.onActivityPing())
}

async function exportReportPdf(report: Report): Promise<{ path: string } | null> {
  const result = await dialog.showSaveDialog({
    defaultPath: `TPS-Report-${report.id}.pdf`,
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
  })

  if (result.canceled || !result.filePath) {
    return null
  }

  const offscreenWindow = new BrowserWindow({
    show: false
  })

  try {
    const html = renderReportHtml(report)
    await offscreenWindow.loadURL(`data:text/html;base64,${Buffer.from(html).toString('base64')}`)

    const pdfBuffer = await offscreenWindow.webContents.printToPDF({
      pageSize: { height: 279600, width: 215900 },
      printBackground: true
    })

    await writeFile(result.filePath, pdfBuffer)

    return { path: result.filePath }
  } finally {
    offscreenWindow.destroy()
  }
}

function getBobsZingerResponse(): BobsResult {
  const critiques = [
    "Well, you see, the thing is, we're not entirely sure what it is that you *do* here. And, you know, the consensus is you're probably not adding a lot of value.",
    "Yeah, well, Bob and I were talking, and we're thinking maybe you could be more productive. You know, going forward.",
    "So I'm going to need you to come in on Saturday. And, uh, bring a cover sheet.",
    "Yeah, we're going to need to have a talk. There's been some concerns about your performance.",
    "Mmm, I'm not sure this aligns with our core competencies. Maybe we should circle back.",
    "You know, the numbers just aren't there. We're thinking maybe this needs some recalibration.",
    'Have you considered a more synergistic approach? We might need to drill down on the ROI here.',
    "The problem is, we're going to need you to really take this to the next level."
  ]

  const critique = critiques[Math.floor(Math.random() * critiques.length)]
  const verdict = rollVerdict()

  return {
    critique,
    question: 'So… what would you say ya do here?',
    verdict
  }
}

function parseBobsResponse(response: string): BobsResult {
  const critiqueMatch = response.match(/CRITIQUE:\s*(.+?)(?=VERDICT:|$)/is)
  const verdictMatch = response.match(/VERDICT:\s*(\w+)/i)

  const critique = critiqueMatch
    ? critiqueMatch[1].trim()
    : 'The report raises some important questions.'
  const verdictStr = verdictMatch ? verdictMatch[1].toLowerCase() : ''

  let verdict: Verdict
  if (verdictStr === 'circle_back' || verdictStr === 'circle back') {
    verdict = 'circle_back'
  } else if (verdictStr === 'basement' || verdictStr === 'basement') {
    verdict = 'basement'
  } else if (verdictStr === 'ship_it' || verdictStr === 'ship it') {
    verdict = 'ship_it'
  } else {
    verdict = rollVerdict()
  }

  return {
    critique,
    question: 'So… what would you say ya do here?',
    verdict
  }
}
