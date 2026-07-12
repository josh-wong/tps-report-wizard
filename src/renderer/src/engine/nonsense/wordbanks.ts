// Per-tone word banks for the Corporate Nonsense Engine (FR-16..FR-19,
// design doc §6, OTD-2: template grammar, not Markov). Each tone gets its
// own sentence templates and slot fillers so output is film-flavored and
// distinguishable from the other tones while staying interchangeable in
// shape with AI output.
import type { Tone } from '@shared/types'

export interface ToneWordBank {
  /** Sentence templates. Slots: {seed} {Seed} {buzz} {noun} {verb} {phrase} */
  sentenceTemplates: string[]
  buzzPhrases: string[]
  nounPhrases: string[]
  verbPhrases: string[]
  phrases: string[]
  /** One extra closing line appended to the report, tone permitting. */
  closingLines: string[]
}

export const WORD_BANKS: Record<Tone, ToneWordBank> = {
  corporate: {
    sentenceTemplates: [
      'Per the initiative to align cross-functional stakeholders on {seed}, this report documents the relevant {noun} and its impact on quarterly {noun}.',
      'Going forward, we will {verb} the {noun} associated with {seed} and socialize the findings with all relevant parties.',
      'Leadership has asked us to circle back on {seed} so we can move the needle on {noun} before end of quarter.',
      'This is a paradigm-level {noun}, and {seed} represents a key learning we intend to operationalize.',
      'To close the loop on {seed}, corrective action items have been {verb} and are pending further alignment.',
      'Synergies identified during the review of {seed} will be leveraged to {verb} downstream {noun}.',
      'We are proactively taking this offline, but wanted to flag that {seed} is now a top-of-mind {noun} for the team.'
    ],
    buzzPhrases: [
      'synergy',
      'bandwidth',
      'a paradigm shift',
      'best-in-class alignment',
      'a value-add',
      'core competency'
    ],
    nounPhrases: [
      'deliverable',
      'action item',
      'workstream',
      'touchpoint',
      'initiative',
      'key performance indicator',
      'bandwidth allocation'
    ],
    verbPhrases: [
      'circled back on',
      'socialized',
      'operationalized',
      'actioned',
      'leveraged',
      'streamlined'
    ],
    phrases: [
      'moving the needle',
      'thinking outside the box',
      'boiling the ocean',
      'taking this offline'
    ],
    closingLines: [
      'No further action is required at this time, pending further alignment.',
      'We will revisit this deliverable at the next all-hands.'
    ]
  },
  lumbergh: {
    sentenceTemplates: [
      'Yeeeah, if you could go ahead and take care of {seed}, that would be greeeat.',
      "So I'm gonna need you to go ahead and address {seed}, and, uh, also come in on Saturday. Thaaanks.",
      "Yeah, I'm also gonna need you to go ahead and, uh, put a new cover sheet on the report about {seed}.",
      'Did you get the memo about {seed}? Yeah. Hmm-kay. If you could just go ahead and read that, that would be greeeat.',
      "We're, uh, going to need to go ahead and move forward on {seed}, if that's not a problem.",
      "Yeah, so, about {seed} — if you could just go ahead and have that done by, uh, tomorrow, that'd be terrific."
    ],
    buzzPhrases: ['that would be greeeat', 'thaaanks', 'if that is not a problem', 'mm-kay'],
    nounPhrases: ['cover sheet', 'memo', 'TPS report', 'flair requirement', 'Saturday shift'],
    verbPhrases: [
      'go ahead and address',
      'go ahead and take care of',
      'circle back on',
      'go ahead and finish'
    ],
    phrases: ['coming in on Saturday', 'the new cover sheet memo', 'a stack of TPS reports'],
    closingLines: [
      "Yeeeah, and I'm also gonna need those TPS reports by tomorrow. Thaaanks.",
      "Mm-kay, so if you could just go ahead and get right on that, that'd be greeeat."
    ]
  },
  milton: {
    sentenceTemplates: [
      'I was told... I could have {seed}, if I just, um, moved my desk to the basement.',
      'Excuse me, I believe you have my stapler... this is regarding {seed}.',
      'I said I could have {seed} if the, um, Swingline situation got resolved, and, uh, nobody said anything to me about it.',
      "I'm not gonna... I'm not gonna say anything, about {seed}, I'm just gonna, um, quietly go back to my desk.",
      'Excuse me, I believe, um, {seed} was supposed to be filed, and, uh, if that could get straightened out, that would be, um, nice.',
      "I have a red Swingline stapler, and, um, it's about {seed}, and, uh, nobody said anything to me about that either."
    ],
    buzzPhrases: ['um', 'uh', 'excuse me', 'if that could get straightened out'],
    nounPhrases: [
      'red Swingline stapler',
      'basement',
      'radio at a reasonable volume',
      'cake in the break room'
    ],
    verbPhrases: ['quietly file', 'mumble about', 'move to the basement', 'not say anything about'],
    phrases: ['moved to the basement', 'the fire in the building', 'a reasonable volume'],
    closingLines: [
      "I'm just gonna... I'm just gonna go ahead and, um, take my stapler back now.",
      'Excuse me. Excuse me. I could set the building on fire. I said that. But, um, I did not.'
    ]
  },
  bobs: {
    sentenceTemplates: [
      "So we looked over the numbers here on {seed}, and, uh, it looks like you've been a bit redundant.",
      'What would you say... you do here, in relation to {seed}?',
      'It looks like {seed} is something that, uh, could be handled in about fifteen minutes a week.',
      "We're gonna need to go ahead and flag {seed} for the, uh, upcoming restructuring review.",
      "So, on the topic of {seed} — that's, uh, that's a great question for you to answer for us.",
      'We just have to ask ourselves, is {seed} really moving the needle, or is it, uh, more of a redundancy?'
    ],
    buzzPhrases: ['what would you say you do here', "that's a great question", 'a bit redundant'],
    nounPhrases: [
      'redundancy',
      'restructuring review',
      'headcount',
      'value stream',
      'consulting engagement'
    ],
    verbPhrases: [
      'flag for restructuring',
      'streamline',
      'consolidate',
      'eliminate the redundancy in'
    ],
    phrases: ['fifteen minutes a week', 'the restructuring review', 'a great question'],
    closingLines: [
      "So, uh, we're gonna go ahead and move forward with the recommendation.",
      "That's, uh, that's a great question. We'll circle back on that."
    ]
  }
}
