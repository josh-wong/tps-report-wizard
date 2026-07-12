export type Provider = 'claude' | 'openai'

export type Tone = 'corporate' | 'lumbergh' | 'milton' | 'bobs'

export type Verdict = 'circle_back' | 'basement' | 'ship_it'

export type ReportStatus = 'draft' | 'filed'

export interface Report {
  id: string // "TPS-0042"
  author: string
  department: string
  date: string
  seed: string // user input — the generation seed
  body: string // generated (or edited) output
  tone: Tone
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
