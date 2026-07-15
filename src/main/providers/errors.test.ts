import { describe, expect, it } from 'vitest'
import { humanizeError } from './errors'

describe('humanizeError', () => {
  it('maps NO_AI_KEY to a settings prompt', () => {
    expect(humanizeError(new Error('NO_AI_KEY'))).toMatch(/API key configured/i)
  })

  it('maps KEY_DECRYPT_FAILED to a re-enter-key message', () => {
    expect(humanizeError(new Error('KEY_DECRYPT_FAILED'))).toMatch(/could not be read/i)
  })

  it('maps a structured 401 status to an auth message', () => {
    expect(humanizeError({ status: 401 })).toMatch(/doesn't seem to be working/)
  })

  it('maps a structured authentication_error type to an auth message', () => {
    expect(humanizeError({ error: { type: 'authentication_error' } })).toMatch(
      /doesn't seem to be working/
    )
  })

  it('maps a structured 429 status to a rate-limit message', () => {
    expect(humanizeError({ status: 429 })).toMatch(/Bobs are in a meeting/)
  })

  it('maps a structured billing_error type to a billing message', () => {
    expect(humanizeError({ error: { type: 'billing_error' } })).toMatch(/out of quota/)
  })

  it('falls back to message string matching for unauthorized text', () => {
    expect(humanizeError(new Error('401 Unauthorized'))).toMatch(/doesn't seem to be working/)
  })

  it('falls back to message string matching for rate limit text', () => {
    expect(humanizeError(new Error('rate limit hit'))).toMatch(/Bobs are in a meeting/)
  })

  it('falls back to message string matching for network errors', () => {
    expect(humanizeError(new Error('ECONNREFUSED'))).toMatch(/reach the server/)
  })

  it('falls back to message string matching for quota errors', () => {
    expect(humanizeError(new Error('insufficient quota'))).toMatch(/out of quota/)
  })

  it('returns a generic message for unrecognized errors', () => {
    expect(humanizeError(new Error('something bizarre happened'))).toMatch(/Something went wrong/)
  })

  it('handles non-Error input without throwing', () => {
    expect(() => humanizeError('a plain string')).not.toThrow()
    expect(() => humanizeError(undefined)).not.toThrow()
  })
})
