// Typed IPC contract shared by the preload script (implementation) and the
// renderer (consumer via `window.electronAPI`). No handlers are wired up in
// the main process yet — that lands with the AI provider and report-workflow
// phases. See docs/design-doc.md §3.
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
  saveReport: 'report:save',
  exportPdf: 'report:exportPdf'
} as const

export interface IpcApi {
  generate(req: GenerateRequest): Promise<GenerateResult>
  reviewWithBobs(req: BobsRequest): Promise<BobsResult>
  testConnection(p: ProviderConfig): Promise<{ ok: boolean; message: string }>
  saveKey(p: ProviderConfig, key: string): Promise<void> // key crosses IN, never OUT
  getProviderStatus(): Promise<{ provider: Provider | null; hasKey: boolean }>
  listReports(): Promise<Report[]>
  saveReport(r: Report): Promise<void>
  exportPdf(r: Report): Promise<{ path: string }>
}
