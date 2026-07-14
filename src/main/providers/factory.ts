import type { ProviderConfig } from '@shared/types'
import type { LlmProvider } from './LlmProvider'
import { ClaudeProvider } from './ClaudeProvider'
import { OpenAiProvider } from './OpenAiProvider'

export function providerFactory(
  config: ProviderConfig,
  key: string,
  tier: 'default' | 'quality' = 'default'
): LlmProvider {
  switch (config.provider) {
    case 'claude':
      return new ClaudeProvider(key, tier)
    case 'openai':
      return new OpenAiProvider(key, tier)
    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}
