import { AUTHORS } from './types'
import type { Author } from './types'

// Dynamic filter (not hardcoded array) maintains consistency as authors scale.
// If new authors are added to AUTHORS, NON_BOBS_AUTHORS automatically includes them.
const NON_BOBS_AUTHORS = AUTHORS.filter((a) => a !== 'bobs')

/**
 * The Bobs review every report—except their own. If the report's author
 * IS the Bobs, a reviewer is instead randomly picked from the other
 * characters, since the Bobs can't review themselves.
 */
export function pickReviewer(author: Author, rng: () => number = Math.random): Author {
  if (author !== 'bobs') return 'bobs'
  return NON_BOBS_AUTHORS[Math.floor(rng() * NON_BOBS_AUTHORS.length)]
}
