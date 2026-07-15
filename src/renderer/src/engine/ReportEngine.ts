import type { Author } from '@shared/types'

export interface ReportEngine {
  generate(seed: string, author: Author): Promise<string>
}
