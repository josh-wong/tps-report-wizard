import { rollVerdict } from '@shared/verdict'
import type { BobsResult } from '@shared/types'

const CRITIQUES_BY_VERDICT = {
  ship_it: [
    "Yeah, this is solid work. We're impressed with the execution and the results here.",
    "You know, this actually shows real initiative. You're clearly taking ownership and delivering.",
    'This is exactly the kind of output we like to see. Good job here.',
    "You've really nailed this one. The approach is sound and the results speak for themselves."
  ],
  circle_back: [
    "Mmm, I'm not entirely sure this aligns with our core competencies. Maybe we should circle back.",
    "Yeah, well, Bob and I were talking, and we're thinking maybe you could approach this differently. You know, going forward.",
    'Have you considered a more synergistic approach? We might need to drill down on the ROI here.',
    "You know, the numbers are okay, but we're thinking maybe this could use some recalibration.",
    "The work is there, but we'd like to see some improvements in execution."
  ],
  basement: [
    "Well, you see, the thing is, we're not entirely sure what it is that you *do* here. And, you know, the consensus is you're probably not adding a lot of value.",
    "So I'm going to need you to come in on Saturday. And, uh, bring a cover sheet.",
    "Yeah, we're going to need to have a talk. There's been some serious concerns about your performance.",
    "The problem is, we're going to need you to really take this to the next level, because right now it's just not cutting it.",
    "We're not seeing the results we need here. This needs significant work."
  ]
}

const QUESTIONS = [
  'So… what would you say ya do here?',
  "Can you walk me through what exactly you're doing?",
  'How is this adding value to the organization?',
  "What's the synergy here?"
]

export function getBobsZinger(): BobsResult {
  const verdict = rollVerdict()
  const critiques = CRITIQUES_BY_VERDICT[verdict]
  const critique = critiques[Math.floor(Math.random() * critiques.length)]
  const question = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]

  return { critique, question, verdict }
}
