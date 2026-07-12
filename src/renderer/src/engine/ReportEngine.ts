import type { Tone } from '@shared/types'

export interface ReportEngine {
  generate(seed: string, tone: Tone): Promise<string>
}
