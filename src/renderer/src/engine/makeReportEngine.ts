import type { ReportEngine } from './ReportEngine'
import { LocalReportEngine } from './LocalReportEngine'

// AI mode swaps in AiReportEngine here; this factory is the single change point.
export function makeReportEngine(): ReportEngine {
  return new LocalReportEngine()
}
