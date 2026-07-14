import OpenAI from 'openai'
import { MODEL_CONFIG } from '@shared/modelConfig'
import type { LlmProvider } from './LlmProvider'
import { humanizeError } from './errors'

export class OpenAiProvider implements LlmProvider {
  readonly id = 'openai' as const
  private readonly model: string
  private readonly client: OpenAI

  constructor(
    private readonly key: string,
    tier: 'default' | 'quality' = 'default'
  ) {
    this.model = MODEL_CONFIG.openai[tier]
    this.client = new OpenAI({ apiKey: this.key })
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
    const res = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    })
    return res.choices[0]?.message?.content ?? ''
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
