// Seeded into storage on first list() so a new user sees content without any setup.
import type { Report } from './types'

const SAMPLE_TIMESTAMP = Date.parse('1999-01-04T09:00:00Z')

export const SAMPLE_REPORTS: Report[] = [
  {
    id: 'TPS-0001',
    author: 'Peter Gibbons',
    department: 'Software / Y2K Remediation',
    date: 'Friday (feels like Monday)',
    seed: 'the printer jammed again',
    body: 'Per the initiative to align cross-functional print-output stakeholders, this specification documents a recurring peripheral throughput event. The device in question has been escalated for corrective action items, which have been circled back and socialized with all relevant parties pending further alignment.\n\nPC LOAD LETTER remains an open question at the executive level.',
    tone: 'corporate',
    coverSheet: true,
    status: 'filed',
    createdAt: SAMPLE_TIMESTAMP,
    updatedAt: SAMPLE_TIMESTAMP
  },
  {
    id: 'TPS-0002',
    author: 'Milton Waddams',
    department: 'Basement / Accounting',
    date: 'Sometime last quarter',
    seed: 'my red Swingline stapler is missing from my desk',
    body: "I was told... I could have my stapler back if I moved my desk to the basement. I moved my desk to the basement and I still don't have my stapler back.\n\nI believe I was told I could listen to the radio at a reasonable volume. Nobody has seen fit to inform me otherwise, so I am continuing to listen to the radio at a reasonable volume.",
    tone: 'milton',
    coverSheet: true,
    status: 'filed',
    createdAt: SAMPLE_TIMESTAMP,
    updatedAt: SAMPLE_TIMESTAMP
  },
  {
    id: 'TPS-0003',
    author: 'Bill Lumbergh',
    department: 'Management',
    date: 'Ongoing',
    seed: 'the Y2K remediation status needs an update',
    body: "Yeeeah, if you could go ahead and get that Y2K remediation status update to me by, say, tomorrow, that would be greeeat. We're a little worried about, uh, next year, so if you could just go ahead and take care of that for us that would be terrific.\n\nOh, and I'm going to also need you to go ahead and come in on Saturday, too. Thaaanks.",
    tone: 'lumbergh',
    coverSheet: true,
    status: 'filed',
    createdAt: SAMPLE_TIMESTAMP,
    updatedAt: SAMPLE_TIMESTAMP
  },
  {
    id: 'TPS-0004',
    author: 'Bob Slydell & Bob Porter',
    department: 'Consulting (external)',
    date: 'Day one',
    seed: 'a flair compliance audit is required',
    body: "So we looked over the numbers here, and, uh, it looks like your flair count is at the minimum. Which is fine. That's — that's exactly what the minimum's there for.\n\nWe just have to ask: what would you say... you do here? Because it doesn't look like anything's been circled back on this in a while.",
    tone: 'bobs',
    coverSheet: true,
    status: 'filed',
    createdAt: SAMPLE_TIMESTAMP,
    updatedAt: SAMPLE_TIMESTAMP
  }
]
