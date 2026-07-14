import Anthropic from '@anthropic-ai/sdk'
import type { TextBlock } from '@anthropic-ai/sdk/resources/messages'
import { MODEL_CONFIG } from '@shared/modelConfig'
import type { LlmProvider } from './LlmProvider'
import { humanizeError } from './errors'

function isTextBlock(block: unknown): block is TextBlock {
  return typeof block === 'object' && block !== null && (block as Record<string, unknown>).type === 'text'
}

export class ClaudeProvider implements LlmProvider {
  readonly id = 'claude' as const
  private readonly model: string

  constructor(
    private readonly key: string,
    tier: 'default' | 'quality' = 'default'
  ) {
    this.model = MODEL_CONFIG.claude[tier]
  }

  async complete({
    system,
    user,
    maxTokens = 700
  }: {
    system: string
    user: string
    maxTokens?: number
  }): Promise<string> {
    const client = new Anthropic({ apiKey: this.key })
    const msg = await client.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }]
    })
    return msg.content
      .filter(isTextBlock)
      .map((b) => b.text)
      .join('')
  }

  async test(): Promise<{ ok: boolean; message: string }> {
    try {
      await new Anthropic({ apiKey: this.key }).models.list()
      return { ok: true, message: 'Great. Great, great, great.' }
    } catch (err) {
      return { ok: false, message: humanizeError(err) }
    }
  }
}
