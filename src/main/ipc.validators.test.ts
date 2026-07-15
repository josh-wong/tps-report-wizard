import { describe, expect, it, vi } from 'vitest'
import type { Report } from '@shared/types'

// ipc.ts imports from 'electron' at module scope (ipcMain, BrowserWindow,
// dialog); none of those are invoked by the validators under test, so a
// minimal stub is enough to let the module load under vitest's node runtime.
vi.mock('electron', () => ({
  ipcMain: { handle: vi.fn() },
  BrowserWindow: vi.fn(),
  dialog: { showSaveDialog: vi.fn() }
}))

const { isValidGenerateRequest, isValidId, isValidProviderConfig, isValidReport } =
  await import('./ipc')

function makeReport(overrides: Partial<Report> = {}): Report {
  return {
    id: 'TPS-0001',
    author: 'Peter Gibbons',
    department: 'IT',
    date: '2026-07-15',
    seed: 'quarterly synergy update',
    body: 'Corporate report body.',
    tone: 'corporate',
    coverSheet: true,
    status: 'draft',
    createdAt: 1,
    updatedAt: 2,
    ...overrides
  }
}

describe('isValidId', () => {
  it('accepts a non-empty string', () => {
    expect(isValidId('TPS-0001')).toBe(true)
  })

  it('rejects an empty string, non-strings, and undefined', () => {
    expect(isValidId('')).toBe(false)
    expect(isValidId(42)).toBe(false)
    expect(isValidId(undefined)).toBe(false)
    expect(isValidId(null)).toBe(false)
  })
})

describe('isValidReport', () => {
  it('accepts a well-formed report', () => {
    expect(isValidReport(makeReport())).toBe(true)
  })

  it('rejects a report with an invalid tone', () => {
    expect(isValidReport(makeReport({ tone: 'sarcastic' as never }))).toBe(false)
  })

  it('rejects a report with an invalid status', () => {
    expect(isValidReport(makeReport({ status: 'archived' as never }))).toBe(false)
  })

  it('rejects a report missing required fields', () => {
    const report = makeReport() as Partial<Report>
    delete report.author
    expect(isValidReport(report)).toBe(false)
  })

  it('rejects non-object input', () => {
    expect(isValidReport(null)).toBe(false)
    expect(isValidReport('report')).toBe(false)
  })
})

describe('isValidGenerateRequest', () => {
  it('accepts a valid seed and tone', () => {
    expect(isValidGenerateRequest({ seed: 'seed text', tone: 'milton' })).toBe(true)
  })

  it('rejects an empty seed', () => {
    expect(isValidGenerateRequest({ seed: '', tone: 'milton' })).toBe(false)
  })

  it('rejects an invalid tone', () => {
    expect(isValidGenerateRequest({ seed: 'seed text', tone: 'sarcastic' })).toBe(false)
  })

  it('rejects non-object input', () => {
    expect(isValidGenerateRequest(null)).toBe(false)
  })
})

describe('isValidProviderConfig', () => {
  it('accepts known providers', () => {
    expect(isValidProviderConfig({ provider: 'claude' })).toBe(true)
    expect(isValidProviderConfig({ provider: 'openai' })).toBe(true)
  })

  it('rejects unknown providers and malformed input', () => {
    expect(isValidProviderConfig({ provider: 'gemini' })).toBe(false)
    expect(isValidProviderConfig(null)).toBe(false)
    expect(isValidProviderConfig({})).toBe(false)
  })
})
