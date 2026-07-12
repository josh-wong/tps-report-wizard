// Web "lite" `ReportStore` backend (design doc §8, FR-27, RD-3). Persists
// both drafts and filed reports to `localStorage` so a refresh keeps work —
// there is no key custody or other sensitive data on web to worry about.
import { SAMPLE_REPORTS } from '@shared/sampleReports'
import type { ReportStore } from '@shared/store'
import type { Report } from '@shared/types'

const STORAGE_KEY = 'tps-reports'

function readAll(): Report[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Report[]) : []
  } catch {
    return []
  }
}

function writeAll(reports: Report[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
}

export class LocalStorageBackend implements ReportStore {
  async list(): Promise<Report[]> {
    const reports = readAll()
    if (reports.length === 0) {
      writeAll(SAMPLE_REPORTS)
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
    writeAll(reports)
  }

  async remove(id: string): Promise<void> {
    const reports = await this.list()
    writeAll(reports.filter((r) => r.id !== id))
  }
}
