// No channel ever returns a decrypted key (SEC-2).
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
  deleteKeys: 'provider:deleteKeys',
  setEngineEnabled: 'provider:setEngineEnabled',
  listReports: 'report:list',
  getReport: 'report:get',
  saveReport: 'report:save',
  removeReport: 'report:remove',
  exportPdf: 'report:exportPdf'
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
}
