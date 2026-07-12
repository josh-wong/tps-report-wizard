// Corporate Nonsense Engine: a fully offline generator that stitches
// template sentences and word-bank slots into grammatically valid,
// semantically empty prose (FR-16..FR-19). The `seed` is woven in as a
// subject noun phrase so the output nods at the user's input without
// meaning anything. Output length is normalized to 2-3 paragraphs, the
// same target as AI mode (FR-19), so the two engines are interchangeable.
import type { Tone } from '@shared/types'
import type { ToneWordBank } from './wordbanks'
import { WORD_BANKS } from './wordbanks'

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function randomInRange(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function fillTemplate(template: string, seed: string, bank: ToneWordBank): string {
  const capitalizedSeed = seed.charAt(0).toUpperCase() + seed.slice(1)
  return template
    .replace(/\{Seed\}/g, capitalizedSeed)
    .replace(/\{seed\}/g, seed)
    .replace(/\{buzz\}/g, () => pick(bank.buzzPhrases))
    .replace(/\{noun\}/g, () => pick(bank.nounPhrases))
    .replace(/\{verb\}/g, () => pick(bank.verbPhrases))
    .replace(/\{phrase\}/g, () => pick(bank.phrases))
}

export function generateBody(seed: string, tone: Tone): string {
  const bank = WORD_BANKS[tone]
  const seedPhrase = seed.trim() || 'the matter at hand'

  const paragraphCount = randomInRange(2, 3)
  const paragraphs: string[] = []
  for (let p = 0; p < paragraphCount; p++) {
    const sentenceCount = randomInRange(2, 3)
    const sentences: string[] = []
    for (let s = 0; s < sentenceCount; s++) {
      const template = pick(bank.sentenceTemplates)
      sentences.push(fillTemplate(template, seedPhrase, bank))
    }
    paragraphs.push(sentences.join(' '))
  }
  paragraphs.push(pick(bank.closingLines))

  return paragraphs.join('\n\n')
}
