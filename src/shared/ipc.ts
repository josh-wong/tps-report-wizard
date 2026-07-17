// No channel ever returns a decrypted key (SEC-2).
import type { BobsResult, Provider, ProviderConfig, Report, Author } from './types'

export interface GenerateRequest {
  seed: string
  author: Author
}

export interface GenerateResult {
  body: string
}

export interface BobsRequest {
  report: Report
}

export const IPC_CHANNELS = {
  generate: 'report:generate',
  reviewWithBobs: 'report:reviewWithBobs',
  testConnection: 'provider:testConnection',
  saveKey: 'provider:saveKey',
  getProviderStatus: 'provider:getStatus',
  deleteKeys: 'provider:deleteKeys',
  setEngineEnabled: 'provider:setEngineEnabled',
  listReports: 'report:list',
  getReport: 'report:get',
  saveReport: 'report:save',
  removeReport: 'report:remove',
  exportPdf: 'report:exportPdf',
  getQuietMode: 'nag:getQuietMode',
  setQuietMode: 'nag:setQuietMode',
  activityPing: 'nag:activityPing',
  setDraftPresent: 'nag:setDraftPresent',
  menuNewReport: 'menu:newReport',
  menuOpenReport: 'menu:openReport',
  menuSaveReport: 'menu:saveReport',
  menuExportPdf: 'menu:exportPdf',
  menuPrint: 'menu:print',
  menuSettings: 'menu:settings',
  menuAbout: 'menu:about',
  menuKeyboardShortcuts: 'menu:keyboardShortcuts',
  menuRecentReports: 'menu:recentReports',
  menuUpdateReportState: 'menu:updateReportState'
} as const

export interface IpcApi {
  generate(req: GenerateRequest): Promise<GenerateResult>
  reviewWithBobs(req: BobsRequest): Promise<BobsResult>
  testConnection(
    p: ProviderConfig,
    candidateKey?: string
  ): Promise<{ ok: boolean; message: string }>
  saveKey(p: ProviderConfig, key: string): Promise<void> // key crosses IN, never OUT
  getProviderStatus(): Promise<{ provider: Provider | null; hasKey: boolean }>
  deleteKeys(p: ProviderConfig): Promise<boolean>
  setEngineEnabled(enabled: boolean): Promise<void>
  listReports(): Promise<Report[]>
  getReport(id: string): Promise<Report | null>
  saveReport(r: Report): Promise<void>
  removeReport(id: string): Promise<void>
  exportPdf(r: Report): Promise<{ path: string } | null>
  getQuietMode(): Promise<boolean>
  setQuietMode(enabled: boolean): Promise<void>
  activityPing(): void
  setDraftPresent(present: boolean): void
}
