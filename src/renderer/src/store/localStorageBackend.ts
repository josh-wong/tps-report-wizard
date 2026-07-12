// No key custody or sensitive data on web; localStorage is sufficient.
import { SAMPLE_REPORTS } from '@shared/sampleReports'
import type { ReportStore } from '@shared/store'
import type { Report } from '@shared/types'

const STORAGE_KEY = 'tps-reports'
const SEEDED_KEY = 'tps-seeded'

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
    if (reports.length === 0 && !localStorage.getItem(SEEDED_KEY)) {
      writeAll(SAMPLE_REPORTS)
      localStorage.setItem(SEEDED_KEY, '1')
      return [...SAMPLE_REPORTS]
    }
    return reports
  }

  async get(id: string): Promise<Report | null> {
    return readAll().find((r) => r.id === id) ?? null
  }

  async save(report: Report): Promise<void> {
    const reports = readAll()
    const index = reports.findIndex((r) => r.id === report.id)
    if (index >= 0) {
      reports[index] = report
    } else {
      reports.push(report)
    }
    writeAll(reports)
  }

  async remove(id: string): Promise<void> {
    writeAll(readAll().filter((r) => r.id !== id))
  }
}
