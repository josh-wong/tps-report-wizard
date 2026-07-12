import type { Tone } from '@shared/types'
import type { ReportEngine } from './ReportEngine'
import { generateBody } from './nonsense/generateBody'

// In-renderer engine backed by the Corporate Nonsense Engine. No network,
// no dependencies — this is the only engine on web and the no-key engine
// on desktop (FR-16..FR-19).
export class LocalReportEngine implements ReportEngine {
  async generate(seed: string, tone: Tone): Promise<string> {
    return generateBody(seed, tone)
  }
}
