import type { Author } from '@shared/types'
import type { ReportEngine } from './ReportEngine'

// Delegates generation to the main process via IPC. The main process owns the
// API key and the LlmProvider; this class never sees either (SEC-1, SEC-2).
export class AiReportEngine implements ReportEngine {
  async generate(seed: string, author: Author): Promise<string> {
    const result = await window.electronAPI.generate({ seed, author })
    return result.body
  }
}
