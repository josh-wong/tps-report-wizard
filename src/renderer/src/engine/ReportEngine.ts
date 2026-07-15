import type { Author, Report, BobsResult } from '@shared/types'

export interface ReportEngine {
  generate(seed: string, author: Author): Promise<string>
  review(report: Report): Promise<BobsResult>
}
