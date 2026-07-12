// Desktop `ReportStore` backend (design doc §8, FR-27). Persists to a JSON
// file via electron-store; report content never leaves the machine through
// this path. Sample reports (FR-4a) are lazily seeded on first read.
import Store from 'electron-store'
import { SAMPLE_REPORTS } from '@shared/sampleReports'
import type { ReportStore } from '@shared/store'
import type { Report } from '@shared/types'

interface ReportsSchema {
  reports: Report[]
}

export class ElectronStoreBackend implements ReportStore {
  private readonly store = new Store<ReportsSchema>({
    name: 'tps-reports',
    defaults: { reports: [] }
  })

  async list(): Promise<Report[]> {
    const reports = this.store.get('reports')
    if (reports.length === 0) {
      this.store.set('reports', SAMPLE_REPORTS)
      return [...SAMPLE_REPORTS]
    }
    return reports
  }

  async get(id: string): Promise<Report | null> {
    const reports = await this.list()
    return reports.find((r) => r.id === id) ?? null
  }

  async save(report: Report): Promise<void> {
    const reports = await this.list()
    const index = reports.findIndex((r) => r.id === report.id)
    if (index >= 0) {
      reports[index] = report
    } else {
      reports.push(report)
    }
    this.store.set('reports', reports)
  }

  async remove(id: string): Promise<void> {
    const reports = await this.list()
    this.store.set(
      'reports',
      reports.filter((r) => r.id !== id)
    )
  }
}
