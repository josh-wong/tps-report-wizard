import type { Author, BobsResult } from '@shared/types'
import type { ReportEngine } from './ReportEngine'
import { generateBody } from './nonsense/generateBody'
import { getBobsZinger } from './nonsense/bobsZingers'

// No network calls—safe to run in the renderer on both desktop and web.
export class LocalReportEngine implements ReportEngine {
  async generate(seed: string, author: Author): Promise<string> {
    return generateBody(seed, author)
  }

  async review(): Promise<BobsResult> {
    return getBobsZinger()
  }
}
