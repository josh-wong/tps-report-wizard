import type { ReportEngine } from './ReportEngine'
import { LocalReportEngine } from './LocalReportEngine'

// AI mode (`AiReportEngine` -> IPC -> `LlmProvider`, design doc §6, §9) is
// wired up in a later phase. Every platform gets the Corporate Nonsense
// Engine for now, which keeps this factory the single place that changes
// once AI mode lands.
export function makeReportEngine(): ReportEngine {
  return new LocalReportEngine()
}
