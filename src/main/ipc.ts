import { writeFile } from 'fs/promises'
import { ipcMain, BrowserWindow, dialog } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc'
import type { GenerateRequest } from '@shared/ipc'
import type { ReportStore } from '@shared/store'
import type { Provider, ProviderConfig, Report, Tone, ReportStatus } from '@shared/types'
import { TONES, REPORT_STATUSES } from '@shared/types'
import { buildSystemPrompt } from '@shared/tonePrompts'
import { renderReportHtml } from './pdf/renderReportHtml'
import type { KeyStore } from './keyStore'
import { providerFactory } from './providers/factory'
import { humanizeError } from './providers/errors'

const VALID_TONES = new Set(TONES)
const VALID_STATUSES = new Set(REPORT_STATUSES)
const VALID_PROVIDERS = new Set<Provider>(['claude', 'openai'])

export function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0
}

export function isValidReport(r: unknown): r is Report {
  if (!r || typeof r !== 'object') return false
  const {
    id,
    author,
    department,
    date,
    seed,
    body,
    tone,
    coverSheet,
    status,
    createdAt,
    updatedAt
  } = r as Record<string, unknown>
  return (
    isValidId(id) &&
    typeof author === 'string' &&
    typeof department === 'string' &&
    typeof date === 'string' &&
    typeof seed === 'string' &&
    typeof body === 'string' &&
    VALID_TONES.has(tone as Tone) &&
    typeof coverSheet === 'boolean' &&
    VALID_STATUSES.has(status as ReportStatus) &&
    typeof createdAt === 'number' &&
    typeof updatedAt === 'number'
  )
}

export function isValidGenerateRequest(r: unknown): r is GenerateRequest {
  if (!r || typeof r !== 'object') return false
  const { seed, tone } = r as Record<string, unknown>
  return typeof seed === 'string' && seed.length > 0 && VALID_TONES.has(tone as Tone)
}

export function isValidProviderConfig(p: unknown): p is ProviderConfig {
  if (!p || typeof p !== 'object') return false
  const { provider } = p as Record<string, unknown>
  return VALID_PROVIDERS.has(provider as Provider)
}

export function registerReportIpcHandlers(store: ReportStore, keyStore: KeyStore): void {
  ipcMain.handle(IPC_CHANNELS.generate, async (_event, req: unknown) => {
    if (!isValidGenerateRequest(req)) throw new Error('Invalid generate request')
    const { seed, tone } = req

    try {
      const status = keyStore.getStatus()
      if (!status.hasKey || !status.provider) {
        throw new Error('NO_AI_KEY')
      }

      const key = keyStore.getKey(status.provider)
      if (!key) throw new Error('NO_AI_KEY')

      const provider = providerFactory({ provider: status.provider }, key)
      const system = buildSystemPrompt(tone)

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

  ipcMain.handle(IPC_CHANNELS.reviewWithBobs, () => {
    throw new Error('Bobs Review is not yet implemented.')
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
  ipcMain.handle(IPC_CHANNELS.saveReport, (_event, report: unknown) => {
    if (!isValidReport(report)) throw new Error('Invalid report payload')
    return store.save(report)
  })
  ipcMain.handle(IPC_CHANNELS.removeReport, (_event, id: unknown) => {
    if (!isValidId(id)) throw new Error('Invalid report id')
    return store.remove(id)
  })
  ipcMain.handle(IPC_CHANNELS.exportPdf, async (_event, report: unknown) => {
    if (!isValidReport(report)) throw new Error('Invalid report payload')
    return exportReportPdf(report as Report)
  })
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
