// Shared domain types used by both the Electron main process and the React
// renderer. Keeping these in one module (imported by both sides of the IPC
// boundary) prevents the AI and local engines from drifting apart.
// See docs/design-doc.md §5 and §8.

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
