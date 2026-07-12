import type { Report } from '@shared/types'

function generateReportId(existingIds: ReadonlySet<string>): string {
  let id: string
  do {
    const n = 1 + Math.floor(Math.random() * 9999)
    id = `TPS-${String(n).padStart(4, '0')}`
  } while (existingIds.has(id))
  return id
}

// date is free-text so users can write things like "Friday (feels like Monday)".
export function createDraftReport(existingReports: readonly Report[]): Report {
  const now = Date.now()
  return {
    id: generateReportId(new Set(existingReports.map((r) => r.id))),
    author: 'Peter Gibbons',
    department: 'Software / Y2K Remediation',
    date: new Date(now).toLocaleDateString(),
    seed: '',
    body: '',
    tone: 'corporate',
    coverSheet: true,
    status: 'draft',
    createdAt: now,
    updatedAt: now
  }
}
