import { describe, expect, it } from 'vitest'
import { PDF_PAGE_SIZE_INCHES } from './pageSize'

describe('PDF_PAGE_SIZE_INCHES', () => {
  it('is US Letter in inches', () => {
    expect(PDF_PAGE_SIZE_INCHES).toEqual({ width: 8.5, height: 11 })
  })

  it('stays within a sane inch range (guards against micron values)', () => {
    expect(PDF_PAGE_SIZE_INCHES.width).toBeLessThan(100)
    expect(PDF_PAGE_SIZE_INCHES.height).toBeLessThan(100)
  })
})
