import { describe, expect, it, vi } from 'vitest'
import { withRateLimitRetry } from './retry'

function rateLimitError(): Error {
  return Object.assign(new Error('rate limit exceeded'), { status: 429 })
}

function authError(): Error {
  return Object.assign(new Error('unauthorized'), { status: 401 })
}

describe('withRateLimitRetry', () => {
  it('returns the result on first success without retrying', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    const result = await withRateLimitRetry(fn, { baseDelayMs: 1 })
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries on a rate-limit error and eventually succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(rateLimitError())
      .mockRejectedValueOnce(rateLimitError())
      .mockResolvedValue('ok')

    const result = await withRateLimitRetry(fn, { retries: 2, baseDelayMs: 1 })
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('gives up after exhausting retries and rethrows the last error', async () => {
    const fn = vi.fn().mockRejectedValue(rateLimitError())

    await expect(withRateLimitRetry(fn, { retries: 2, baseDelayMs: 1 })).rejects.toThrow(
      'rate limit exceeded'
    )
    expect(fn).toHaveBeenCalledTimes(3) // initial attempt + 2 retries
  })

  it('rethrows immediately on a non-rate-limit error without retrying', async () => {
    const fn = vi.fn().mockRejectedValue(authError())

    await expect(withRateLimitRetry(fn, { retries: 2, baseDelayMs: 1 })).rejects.toThrow(
      'unauthorized'
    )
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
