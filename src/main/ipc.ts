// Main-process IPC handlers wired to the shared contract (shared/ipc.ts).
// Only report persistence is implemented in this phase — generate,
// reviewWithBobs, testConnection, saveKey, getProviderStatus, and exportPdf
// land with the AI provider and export/cover-sheet phases.
import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc'
import type { ReportStore } from '@shared/store'
import type { Report } from '@shared/types'

export function registerReportIpcHandlers(store: ReportStore): void {
  ipcMain.handle(IPC_CHANNELS.listReports, () => store.list())
  ipcMain.handle(IPC_CHANNELS.getReport, (_event, id: string) => store.get(id))
  ipcMain.handle(IPC_CHANNELS.saveReport, (_event, report: Report) => store.save(report))
  ipcMain.handle(IPC_CHANNELS.removeReport, (_event, id: string) => store.remove(id))
}
