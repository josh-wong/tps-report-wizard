import { describe, it, expect } from 'vitest'
import { rollVerdict } from './verdict'

describe('rollVerdict', () => {
  it('should return circle_back for r < 0.55', () => {
    const verdict = rollVerdict(() => 0.54)
    expect(verdict).toBe('circle_back')
  })

  it('should return basement for 0.55 <= r < 0.90', () => {
    expect(rollVerdict(() => 0.55)).toBe('basement')
    expect(rollVerdict(() => 0.89)).toBe('basement')
  })

  it('should return ship_it for r >= 0.90', () => {
    expect(rollVerdict(() => 0.9)).toBe('ship_it')
    expect(rollVerdict(() => 0.99)).toBe('ship_it')
  })

  it('should produce correct distribution over many rolls', () => {
    const trials = 10000
    const results = { circle_back: 0, basement: 0, ship_it: 0 }

    for (let i = 0; i < trials; i++) {
      const result = rollVerdict(() => Math.random())
      results[result]++
    }

    const circleBackPct = results.circle_back / trials
    const basementPct = results.basement / trials
    const shipItPct = results.ship_it / trials

    // Allow ±2% tolerance
    expect(circleBackPct).toBeGreaterThan(0.53)
    expect(circleBackPct).toBeLessThan(0.57)

    expect(basementPct).toBeGreaterThan(0.33)
    expect(basementPct).toBeLessThan(0.37)

    expect(shipItPct).toBeGreaterThan(0.08)
    expect(shipItPct).toBeLessThan(0.12)
  })

  it('should use Math.random() by default', () => {
    const verdicts = new Set()
    for (let i = 0; i < 100; i++) {
      verdicts.add(rollVerdict())
    }
    // With 100 rolls, we should see at least 2 different outcomes
    expect(verdicts.size).toBeGreaterThanOrEqual(2)
  })
})
