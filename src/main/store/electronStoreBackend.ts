// Report content never leaves the machine through this path (SEC-1).
import Store from 'electron-store'
import { SAMPLE_REPORTS } from '@shared/sampleReports'
import type { ReportStore } from '@shared/store'
import type { Report } from '@shared/types'
import { migrateReport } from '@shared/migrateReport'

interface ReportsSchema {
  reports: Report[]
  seeded: boolean
}

export class ElectronStoreBackend implements ReportStore {
  private readonly store = new Store<ReportsSchema>({
    name: 'tps-reports',
    defaults: { reports: [], seeded: false }
  })

  private readRaw(): Report[] {
    return this.store.get('reports')
  }

  async list(): Promise<Report[]> {
    const reports = this.readRaw()
    if (reports.length === 0 && !this.store.get('seeded')) {
      this.store.set({ reports: SAMPLE_REPORTS, seeded: true })
      return [...SAMPLE_REPORTS]
    }
    const migrated = reports.map(migrateReport)
    if (migrated.some((r, i) => r !== reports[i])) {
      this.store.set('reports', migrated)
    }
    return migrated
  }

  async get(id: string): Promise<Report | null> {
    return this.readRaw().find((r) => r.id === id) ?? null
  }

  async save(report: Report): Promise<void> {
    const reports = this.readRaw()
    const index = reports.findIndex((r) => r.id === report.id)
    if (index >= 0) {
      reports[index] = report
    } else {
      reports.push(report)
    }
    this.store.set('reports', reports)
  }

  async remove(id: string): Promise<void> {
    this.store.set(
      'reports',
      this.readRaw().filter((r) => r.id !== id)
    )
  }
}
