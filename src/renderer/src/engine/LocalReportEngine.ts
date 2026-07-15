import type { Author } from '@shared/types'
import type { ReportEngine } from './ReportEngine'
import { generateBody } from './nonsense/generateBody'

// No network calls — safe to run in the renderer on both desktop and web.
export class LocalReportEngine implements ReportEngine {
  async generate(seed: string, author: Author): Promise<string> {
    return generateBody(seed, author)
  }
}
