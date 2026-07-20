import { describe, it, expect } from 'vitest'
import { migrateReport } from './migrateReport'
import type { Report } from './types'

// Legacy persisted JSON predates the current `Author` union, so `author`/`tone` are
// loosely typed here to mirror what's actually read off disk before migration.
type LegacyReport = Omit<Report, 'author'> & { author: string; tone?: string }

function makeReport(overrides: Partial<LegacyReport>): Report & { tone?: string } {
  const report: LegacyReport = {
    id: 'TPS-0001',
    author: 'peter',
    department: 'Accounting',
    date: '2026-07-20',
    seed: 'some seed',
    body: 'some body',
    coverSheet: true,
    status: 'draft',
    createdAt: 0,
    updatedAt: 0,
    ...overrides
  }
  return report as unknown as Report & { tone?: string }
}

describe('migrateReport', () => {
  it('returns the same reference when author is already valid', () => {
    const report = makeReport({ author: 'milton' })
    expect(migrateReport(report)).toBe(report)
  })

  it.each([
    ['corporate', 'peter'],
    ['lumbergh', 'lumbergh'],
    ['milton', 'milton'],
    ['bobs', 'bobs']
  ] as const)('maps legacy tone %s to author %s', (tone, expectedAuthor) => {
    const report = makeReport({ author: 'Peter Gibbons', tone })
    const migrated = migrateReport(report)

    expect(migrated.author).toBe(expectedAuthor)
    expect(migrated).not.toBe(report)
    expect('tone' in migrated).toBe(false)
  })

  it('falls back to peter for an unrecognized tone', () => {
    const report = makeReport({ author: 'Some Name', tone: 'unknown-tone' })
    expect(migrateReport(report).author).toBe('peter')
  })

  it('falls back to peter when tone is missing entirely', () => {
    const report = makeReport({ author: 'Some Name' })
    delete report.tone
    expect(migrateReport(report).author).toBe('peter')
  })
})
