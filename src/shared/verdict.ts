import type { Verdict } from './types'

export function rollVerdict(rng: () => number = Math.random): Verdict {
  const r = rng()
  if (r < 0.55) return 'circle_back'
  if (r < 0.90) return 'basement'
  return 'ship_it'
}
