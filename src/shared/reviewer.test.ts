import { describe, it, expect } from 'vitest'
import { pickReviewer } from './reviewer'
import { AUTHORS } from './types'
import type { Author } from './types'

describe('pickReviewer', () => {
  it('returns bobs when author is peter', () => {
    expect(pickReviewer('peter')).toBe('bobs')
  })

  it('returns bobs when author is lumbergh', () => {
    expect(pickReviewer('lumbergh')).toBe('bobs')
  })

  it('returns bobs when author is milton', () => {
    expect(pickReviewer('milton')).toBe('bobs')
  })

  it('returns one of the non-bobs authors when author is bobs', () => {
    const nonBobsAuthors = AUTHORS.filter((a) => a !== 'bobs')
    const results = new Set<Author>()
    for (let i = 0; i < 100; i++) {
      const result = pickReviewer('bobs', Math.random)
      results.add(result)
      expect(nonBobsAuthors).toContain(result)
    }
    expect(results.size).toBeGreaterThan(1)
  })

  it('never returns bobs when author is bobs', () => {
    for (let i = 0; i < 100; i++) {
      expect(pickReviewer('bobs', Math.random)).not.toBe('bobs')
    }
  })

  it('returns deterministic results with injected rng', () => {
    expect(pickReviewer('bobs', () => 0)).toBe('peter')
    expect(pickReviewer('bobs', () => 0.4)).toBe('milton')
    expect(pickReviewer('bobs', () => 0.8)).toBe('joanna')
  })
})
