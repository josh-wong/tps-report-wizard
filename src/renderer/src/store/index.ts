import { isDesktop } from '@renderer/platform/isDesktop'
import type { ReportStore } from '@shared/store'
import { ElectronIpcBackend } from './electronIpcBackend'
import { LocalStorageBackend } from './localStorageBackend'

export function makeReportStore(): ReportStore {
  return isDesktop ? new ElectronIpcBackend() : new LocalStorageBackend()
}
