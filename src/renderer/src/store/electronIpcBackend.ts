// The renderer never touches the filesystem; all persistence goes through IPC.
import type { ReportStore } from '@shared/store'
import type { Report } from '@shared/types'

export class ElectronIpcBackend implements ReportStore {
  async list(): Promise<Report[]> {
    return window.electronAPI.listReports()
  }

  async get(id: string): Promise<Report | null> {
    return window.electronAPI.getReport(id)
  }

  async save(report: Report): Promise<void> {
    await window.electronAPI.saveReport(report)
  }

  async remove(id: string): Promise<void> {
    await window.electronAPI.removeReport(id)
  }
}
