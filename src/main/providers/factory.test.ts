import { describe, expect, it } from 'vitest'
import { providerFactory } from './factory'
import { ClaudeProvider } from './ClaudeProvider'
import { OpenAiProvider } from './OpenAiProvider'

describe('providerFactory', () => {
  it('returns a ClaudeProvider for provider "claude"', () => {
    const provider = providerFactory({ provider: 'claude' }, 'sk-ant-test')
    expect(provider).toBeInstanceOf(ClaudeProvider)
    expect(provider.id).toBe('claude')
  })

  it('returns an OpenAiProvider for provider "openai"', () => {
    const provider = providerFactory({ provider: 'openai' }, 'sk-proj-test')
    expect(provider).toBeInstanceOf(OpenAiProvider)
    expect(provider.id).toBe('openai')
  })

  it('throws for an unknown provider', () => {
    expect(() => providerFactory({ provider: 'gemini' as never }, 'key')).toThrow(
      /Unknown provider/
    )
  })
})
