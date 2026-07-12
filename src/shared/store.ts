import type { Report } from './types'

export interface ReportStore {
  list(): Promise<Report[]>
  get(id: string): Promise<Report | null>
  save(r: Report): Promise<void>
  remove(id: string): Promise<void>
}
