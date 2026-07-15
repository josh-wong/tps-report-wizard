import type { Author } from './types'

const NON_BOBS_AUTHORS: readonly Author[] = ['peter', 'lumbergh', 'milton']

/**
 * The Bobs review every report — except their own. If the report's author
 * IS the Bobs, a reviewer is instead randomly picked from the other three
 * characters, since the Bobs can't review themselves.
 */
export function pickReviewer(author: Author, rng: () => number = Math.random): Author {
  if (author !== 'bobs') return 'bobs'
  return NON_BOBS_AUTHORS[Math.floor(rng() * NON_BOBS_AUTHORS.length)]
}
