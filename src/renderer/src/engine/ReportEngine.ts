// Facade so screen code never branches on AI vs. local (design doc §6).
// This phase only implements `generate`; the AI engine and Bobs review
// land in later phases.
import type { Tone } from '@shared/types'

export interface ReportEngine {
  generate(seed: string, tone: Tone): Promise<string>
}
