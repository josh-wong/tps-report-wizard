import { describe, expect, it } from 'vitest'
import { estimateGenerationCost, formatCost } from './costEstimator'

describe('estimateGenerationCost', () => {
  it('increases with a longer seed', () => {
    const shortCost = estimateGenerationCost('short seed', 'peter', 'claude')
    const longCost = estimateGenerationCost('a much longer seed '.repeat(20), 'peter', 'claude')
    expect(longCost).toBeGreaterThan(shortCost)
  })

  it('returns a positive cost even for an empty seed (system prompt still costs tokens)', () => {
    expect(estimateGenerationCost('', 'milton', 'openai')).toBeGreaterThan(0)
  })

  it('differs between providers due to differing per-token pricing', () => {
    const claudeCost = estimateGenerationCost('seed text', 'bobs', 'claude')
    const openaiCost = estimateGenerationCost('seed text', 'bobs', 'openai')
    expect(claudeCost).not.toBe(openaiCost)
  })
})

describe('formatCost', () => {
  it('formats sub-mill amounts using the micro-dollar unit', () => {
    expect(formatCost(0.0000005)).toBe('~$0.50µ')
  })

  it('formats larger amounts as dollars to 4 decimal places', () => {
    expect(formatCost(0.0034)).toBe('~$0.0034')
  })
})
