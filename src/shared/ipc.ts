// Typed IPC contract shared by the preload script (implementation) and the
// renderer (consumer via `window.electronAPI`). Report persistence handlers
// (list/get/save/remove) are wired up in the main process as of the core
// report workflow phase; generate/reviewWithBobs/testConnection/saveKey/
// getProviderStatus/exportPdf remain unwired until the AI provider and
// export phases. See docs/design-doc.md §3.
import type { BobsResult, Provider, ProviderConfig, Report, Tone } from './types'

export interface GenerateRequest {
  seed: string
  tone: Tone
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
  listReports: 'report:list',
  getReport: 'report:get',
  saveReport: 'report:save',
  removeReport: 'report:remove',
  exportPdf: 'report:exportPdf'
} as const

export interface IpcApi {
  generate(req: GenerateRequest): Promise<GenerateResult>
  reviewWithBobs(req: BobsRequest): Promise<BobsResult>
  testConnection(p: ProviderConfig): Promise<{ ok: boolean; message: string }>
  saveKey(p: ProviderConfig, key: string): Promise<void> // key crosses IN, never OUT
  getProviderStatus(): Promise<{ provider: Provider | null; hasKey: boolean }>
  listReports(): Promise<Report[]>
  getReport(id: string): Promise<Report | null>
  saveReport(r: Report): Promise<void>
  removeReport(id: string): Promise<void>
  exportPdf(r: Report): Promise<{ path: string }>
}
