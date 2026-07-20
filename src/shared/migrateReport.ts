import { AUTHORS, type Author, type Report } from './types'

// Pre-#13 schema used a free-text `author` display name plus a separate
// `tone` enum that actually drove the generated voice.
const LEGACY_TONE_TO_AUTHOR: Record<string, Author> = {
  corporate: 'peter',
  lumbergh: 'lumbergh',
  milton: 'milton',
  bobs: 'bobs'
}

function isValidAuthor(value: unknown): value is Author {
  return typeof value === 'string' && (AUTHORS as readonly string[]).includes(value)
}

// Reports persisted before the tone-selector-to-author-selector refactor (#13) have
// `author` set to a display name (e.g. "Peter Gibbons") and voice driven by a separate
// `tone` field, neither of which match today's `Report.author` shape. Coerce those into
// a valid Author so lookups like WORD_BANKS[report.author] don't hit undefined.
export function migrateReport(raw: Report & { tone?: string }): Report {
  if (isValidAuthor(raw.author)) return raw

  const { tone, ...rest } = raw
  const migratedAuthor = (tone && LEGACY_TONE_TO_AUTHOR[tone]) || 'peter'
  return { ...rest, author: migratedAuthor }
}
