import type { Verdict } from '@shared/types'

export const VERDICT_LABELS: Record<Verdict, string> = {
  ship_it: '✓ Ship it',
  circle_back: '↻ Circle back',
  basement: '↓ Move down to basement',
}
