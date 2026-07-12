import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc'
import type { ReportStore } from '@shared/store'
import type { Report, Tone, ReportStatus } from '@shared/types'

const VALID_TONES = new Set<string>(['corporate', 'lumbergh', 'milton', 'bobs'])
const VALID_STATUSES = new Set<string>(['draft', 'filed'])

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0
}

function isValidReport(r: unknown): r is Report {
  if (!r || typeof r !== 'object') return false
  const { id, author, department, date, seed, body, tone, coverSheet, status, createdAt, updatedAt } =
    r as Record<string, unknown>
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
    if (isValidId(id)) return store.remove(id)
  })
}
