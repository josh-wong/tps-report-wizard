import { rollVerdict } from '@shared/verdict'
import type { BobsResult } from '@shared/types'

const CRITIQUES = [
  "Well, you see, the thing is, we're not entirely sure what it is that you *do* here. And, you know, the consensus is you're probably not adding a lot of value.",
  "Yeah, well, Bob and I were talking, and we're thinking maybe you could be more productive. You know, going forward.",
  "So I'm going to need you to come in on Saturday. And, uh, bring a cover sheet.",
  "Yeah, we're going to need to have a talk. There's been some concerns about your performance.",
  "Mmm, I'm not sure this aligns with our core competencies. Maybe we should circle back.",
  "You know, the numbers just aren't there. We're thinking maybe this needs some recalibration.",
  "Have you considered a more synergistic approach? We might need to drill down on the ROI here.",
  "The problem is, we're going to need you to really take this to the next level.",
]

const QUESTIONS = [
  "So… what would you say ya do here?",
  "Can you walk me through what exactly you're doing?",
  "How is this adding value to the organization?",
  "What's the synergy here?",
]

export function getBobsZinger(): BobsResult {
  const critique = CRITIQUES[Math.floor(Math.random() * CRITIQUES.length)]
  const question = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]
  const verdict = rollVerdict()

  return { critique, question, verdict }
}
