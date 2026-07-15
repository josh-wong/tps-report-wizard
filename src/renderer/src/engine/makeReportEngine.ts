import { isDesktop } from '@renderer/platform/isDesktop'
import type { ReportEngine } from './ReportEngine'
import { AiReportEngine } from './AiReportEngine'
import { LocalReportEngine } from './LocalReportEngine'

// Pass hasAiKey=true (from getProviderStatus) to get the AI engine on desktop.
// Without a key, both desktop and web fall back to the local nonsense engine.
export function makeReportEngine(hasAiKey = false): ReportEngine {
  if (isDesktop && hasAiKey) return new AiReportEngine()
  return new LocalReportEngine()
}
