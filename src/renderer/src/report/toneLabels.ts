import type { Tone } from '@shared/types'

// Human-readable tone labels (FR-8) shared by the tone selector and report
// list/cards so the two stay in sync.
export const TONE_LABELS: Record<Tone, string> = {
  corporate: 'Corporate',
  lumbergh: 'Passive-Aggressive Lumbergh',
  milton: 'Milton Mumble',
  bobs: 'The Bobs (consultant-speak)'
}
