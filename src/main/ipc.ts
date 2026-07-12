import { writeFile } from 'fs/promises'
import { ipcMain, BrowserWindow, dialog } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc'
import type { ReportStore } from '@shared/store'
import type { Report, Tone, ReportStatus } from '@shared/types'
import { TONES, REPORT_STATUSES } from '@shared/types'
import { renderReportHtml } from './pdf/renderReportHtml'

const VALID_TONES = new Set(TONES)
const VALID_STATUSES = new Set(REPORT_STATUSES)

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0
}

function isValidReport(r: unknown): r is Report {
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

export function registerReportIpcHandlers(store: ReportStore): void {
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
