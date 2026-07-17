import type { Author } from '@shared/types'

export interface AuthorWordBank {
  /** Sentence templates. Slots: {seed} {Seed} {buzz} {noun} {verb} {phrase} */
  sentenceTemplates: string[]
  buzzPhrases: string[]
  nounPhrases: string[]
  verbPhrases: string[]
  phrases: string[]
  /** One extra closing line appended to the report, author permitting. */
  closingLines: string[]
}

export const WORD_BANKS: Record<Author, AuthorWordBank> = {
  peter: {
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
  },
  joanna: {
    sentenceTemplates: [
      "Look, here's the thing about {seed}: people are gonna do what they're gonna do, and no amount of reporting changes that.",
      'I deal with all types in here, and {seed} is basically the same nonsense you see in any crowd.',
      'The core issue with {seed} is that nobody really wants to admit what the problem actually is.',
      "If I had a dollar for every time someone tried to spin {seed} into something it isn't, I could retire.",
      '{seed} is simple if you strip away all the corporate BS and just look at what people actually need.',
      'Been mixing drinks and listening to people for years, and {seed} is just the usual confusion.'
    ],
    buzzPhrases: [
      'here is the thing',
      'nobody wants to admit',
      'strip away the BS',
      'people are gonna do'
    ],
    nounPhrases: [
      'the real issue',
      'the bottom line',
      'human nature',
      'simple truth',
      'the bar crowd'
    ],
    verbPhrases: ['cut through', 'strip away', 'get to the heart of', 'see through'],
    phrases: ['all types of people', 'corporate nonsense', 'what people actually need'],
    closingLines: [
      'At the end of the day, it is what it is.',
      'So that is my report. Now, what can I get you to drink?'
    ]
  },
  michael: {
    sentenceTemplates: [
      'Now, regarding {seed}, and I want to be very clear on this point, {seed} requires technical acumen.',
      'Not to brag, but I have specific expertise in {seed}, unlike some consultants I could mention.',
      'The issue with {seed}, for those who might not have my background, is actually quite nuanced and technically sophisticated.',
      'Let me be perfectly clear: {seed} is not, I repeat, not something a layperson can just grasp without consulting someone like myself.',
      "To address {seed}, one must understand that it's more complex than the name might suggest, much like my own situation.",
      'I have been asked countless times to explain {seed} — and no, that is not a reference to the musician Michael Bolton.'
    ],
    buzzPhrases: [
      'let me be clear',
      'technical expertise',
      'not to brag',
      'for those of us who understand'
    ],
    nounPhrases: [
      'technical acumen',
      'sophisticated analysis',
      'my consulting background',
      'the Michael Bolton confusion'
    ],
    verbPhrases: [
      'to clarify',
      'require detailed analysis',
      'demand expertise',
      'must be understood'
    ],
    phrases: ['unlike other consultants', 'nuanced and sophisticated', 'for those who understand'],
    closingLines: [
      'So, as I have hopefully made clear, {seed} is a matter for professionals.',
      'And to be clear, I am not the singer.'
    ]
  },
  samir: {
    sentenceTemplates: [
      'So {seed} is yet another example of corporate bureaucracy that consumes massive resources for minimal output.',
      'I have spent considerable time debugging the {seed} situation, and the root cause is organizational structure, not technical failure.',
      'The redundant layers of approval for {seed} make it physically impossible to work efficiently.',
      '{seed} has evolved into a perfect metaphor for everything wrong with corporate software development.',
      'Someone, somewhere decided that {seed} was critical, and now we are all stuck implementing solutions for invented problems.',
      'The tragic irony of {seed} is that it takes two weeks to ship something that was supposed to take two hours.'
    ],
    buzzPhrases: ['corporate bureaucracy', 'redundant layers', 'invented problems', 'tragic irony'],
    nounPhrases: [
      'code review process',
      'approval layers',
      'resource waste',
      'organizational overhead'
    ],
    verbPhrases: ['debug', 'refactor to accommodate', 'work around', 'compensate for'],
    phrases: [
      'corporate inefficiency',
      'layers of bureaucracy',
      'shipping delays caused by nonsense'
    ],
    closingLines: [
      'That is the report on {seed}. I will now return to implementing workarounds.',
      'In conclusion, this is all a waste of engineering talent.'
    ]
  },
  tom: {
    sentenceTemplates: [
      'I have been very busy managing the {seed} initiative, and without my leadership, it would have collapsed entirely.',
      'My unique role requires me to oversee {seed} from a strategic vantage point that only I can occupy.',
      'The team came to me with {seed}, and I immediately saw the bigger picture that others had missed.',
      'In my experience, {seed} is the kind of thing that requires a middle manager with vision, which is why I took point on it.',
      "I coordinate across so many departments that only I understand the full scope of {seed}'s implications.",
      'There was a time before I took charge of {seed}, and frankly, things were a mess until I stepped in.'
    ],
    buzzPhrases: [
      'only I can see',
      'my unique role',
      'strategic vantage point',
      'without my leadership',
      'took point on it'
    ],
    nounPhrases: [
      'the big picture',
      'my oversight',
      'strategic vision',
      'cross-department coordination'
    ],
    verbPhrases: ['took charge of', 'coordinate', 'oversee at the strategic level', 'manage'],
    phrases: ['before I stepped in', 'unique position to understand', 'strategic implications'],
    closingLines: [
      'That is why {seed} would not function without my involvement.',
      'And that is the value that I bring to this organization.'
    ]
  }
}
