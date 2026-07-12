// Storage abstraction shared by both backends (design doc §8, FR-26..FR-28).
// `ElectronStoreBackend` (main process, desktop) and `LocalStorageBackend`
// (renderer, web) both implement this so feature code never branches on
// which one is active — the renderer only ever sees the interface.
import type { Report } from './types'

export interface ReportStore {
  list(): Promise<Report[]>
  get(id: string): Promise<Report | null>
  save(r: Report): Promise<void>
  remove(id: string): Promise<void>
}
