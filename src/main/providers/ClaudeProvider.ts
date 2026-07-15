import Anthropic from '@anthropic-ai/sdk'
import type { TextBlock } from '@anthropic-ai/sdk/resources/messages'
import { MODEL_CONFIG } from '@shared/modelConfig'
import type { LlmProvider } from './LlmProvider'
import { humanizeError } from './errors'

function isTextBlock(block: unknown): block is TextBlock {
  return (
    typeof block === 'object' &&
    block !== null &&
    (block as Record<string, unknown>).type === 'text'
  )
}

export class ClaudeProvider implements LlmProvider {
  readonly id = 'claude' as const
  private readonly model: string
  private readonly client: Anthropic

  constructor(private readonly key: string) {
    this.model = MODEL_CONFIG.claude.default
    this.client = new Anthropic({ apiKey: this.key })
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
    const msg = await this.client.messages.create({
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
      await this.client.models.list()
      return { ok: true, message: 'Great. Great, great, great.' }
    } catch (err) {
      return { ok: false, message: humanizeError(err) }
    }
  }
}
