export type Provider = 'claude' | 'openai'

export const AUTHORS = ['peter', 'lumbergh', 'milton', 'bobs'] as const
export type Author = (typeof AUTHORS)[number]

export type Verdict = 'circle_back' | 'basement' | 'ship_it'

export const REPORT_STATUSES = ['draft', 'filed'] as const
export type ReportStatus = (typeof REPORT_STATUSES)[number]

export interface Report {
  id: string // "TPS-0042"
  author: Author
  department: string
  date: string
  seed: string // user input — the generation seed
  body: string // generated (or edited) output
  coverSheet: boolean // default true
  status: ReportStatus
  createdAt: number
  updatedAt: number
}

export interface ProviderConfig {
  provider: Provider
}

export interface BobsResult {
  critique: string
  question: string
  verdict: Verdict
}
