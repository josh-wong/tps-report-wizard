import type { Author } from './types'

// Display labels for all authors. Ordered to match AUTHORS array from types.ts
// (peter, lumbergh, bobs, milton, michael, samir, joanna, tom) for clarity during maintenance.
export const AUTHOR_LABELS: Record<Author, string> = {
  peter: 'Peter Gibbons',
  lumbergh: 'Bill Lumbergh',
  bobs: 'The Bobs',
  milton: 'Milton Waddams',
  michael: 'Michael Bolton',
  samir: 'Samir Nagheenanajar',
  joanna: 'Joanna',
  tom: 'Tom Smykowski'
}
