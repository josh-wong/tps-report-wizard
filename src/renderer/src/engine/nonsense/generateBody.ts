import type { Author } from '@shared/types'
import type { AuthorWordBank } from './wordbanks'
import { WORD_BANKS } from './wordbanks'

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function randomInRange(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function fillTemplate(template: string, seed: string, bank: AuthorWordBank): string {
  const capitalizedSeed = seed.charAt(0).toUpperCase() + seed.slice(1)
  return template
    .replace(/\{Seed\}/g, () => capitalizedSeed)
    .replace(/\{seed\}/g, () => seed)
    .replace(/\{buzz\}/g, () => pick(bank.buzzPhrases))
    .replace(/\{noun\}/g, () => pick(bank.nounPhrases))
    .replace(/\{verb\}/g, () => pick(bank.verbPhrases))
    .replace(/\{phrase\}/g, () => pick(bank.phrases))
}

export function generateBody(seed: string, author: Author): string {
  const bank = WORD_BANKS[author]
  const seedPhrase = seed.trim() || 'the matter at hand'

  const paragraphCount = randomInRange(2, 3)
  const paragraphs: string[] = []
  for (let p = 0; p < paragraphCount; p++) {
    const sentenceCount = randomInRange(2, 3)
    const sentences: string[] = []
    let lastTemplate = ''
    for (let s = 0; s < sentenceCount; s++) {
      let template = pick(bank.sentenceTemplates)
      // Avoid picking the same template twice in a row within a paragraph
      while (template === lastTemplate && bank.sentenceTemplates.length > 1) {
        template = pick(bank.sentenceTemplates)
      }
      lastTemplate = template
      sentences.push(fillTemplate(template, seedPhrase, bank))
    }
    paragraphs.push(sentences.join(' '))
  }
  paragraphs.push(pick(bank.closingLines))

  return paragraphs.join('\n\n')
}
