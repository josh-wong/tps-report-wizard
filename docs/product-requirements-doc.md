# Product Requirements Document – Initech TPS Report Wizard '99

> _"Did you get the memo?"_ – Everyone, repeatedly.

| | |
|---|---|
| **Name** | Initech TPS Report Wizard '99 (final) |
| **Status** | Reviewed – open questions resolved |
| **Version** | 0.2 |
| **Owner** | Josh |
| **Type** | Cross-platform desktop app (Electron) + static web "lite" version |
| **Tone** | Tongue-in-cheek. This is a joke. The joke is that it works. |

---

## 1. Summary

A deliberately over-engineered app for producing **TPS reports**—the canonical piece of pointless corporate paperwork from _Office Space_—that "improves" the process through automation and optional AI. The comedic thesis is that if a report exists only to be filed and never read, then the logical endgame of automation is to let the machine both **write** it and **remember the cover sheet**, removing every human pain point the film mocks (the forgotten cover sheet, the eight redundant bosses, the soul-crushing prose).

It ships in two forms from one codebase:

- A **downloadable desktop app** (Windows / macOS / Linux) with optional AI report generation via the user's own OpenAI or Claude API key.
- A **static web "lite" version** (e.g. GitHub Pages) that runs the comedy experience with no key, no backend, and no AI.

The look and feel is committed late-'90s Initech: beige window chrome, navy title bars, raised buttons, "Y2K Compliant ✓."

---

## 2. Goals and non-goals

### Goals
- G1 – Make people who love _Office Space_ laugh, then quietly realize the automation logic is uncomfortably sound.
- G2 – Produce a shippable, genuinely functional app, not a static gag. The joke lands *because* it works.
- G3 – Support AI report generation via **either** OpenAI **or** Claude, user's choice, using a key the user provides.
- G4 – Work fully **without** any AI key—the local mode is a first-class experience, not a degraded one.
- G5 – Be shareable by URL (web lite) while keeping AI and API keys safely on the desktop only.
- G6 – Keep the architecture clean enough to feed directly into a design doc and later development.

### Non-goals
- NG1 – Not a real enterprise document system. No cloud sync, no multi-user, no accounts (v1).
- NG2 – Not a general-purpose AI writing tool. Scope is TPS reports and their surrounding bureaucracy.
- NG3 – Not shipping AI mode on the web. See §7 for why (key custody + provider CORS).
- NG4 – Not asking the user for a key on the web build at all (avoids the exposure question entirely).

---

## 3. Background: the premise

In _Office Space_, Peter Gibbons is ambushed by roughly eight managers—Lumbergh chief among them—each individually reminding him he forgot the **new cover sheet** on the **TPS reports**. The reports themselves are meaningless; their only function is to be filed. This app treats that as a solved-problem statement:

| Film pain point | Automated "improvement" |
|---|---|
| Forgetting the cover sheet | Auto-attached, on by default, per the memo. |
| Eight bosses reminding you separately | One consolidated memo. (v2) |
| Writing soul-crushing corporate prose | Generated for you by AI or by a local nonsense engine. |
| Reports nobody reads | Still nobody reads them. Efficiency achieved. |

---

## 4. Target users

- **Primary – "The fan who ships."** Knows the movie by heart, wants a working desk toy, will actually generate a report to screenshot and share.
- **Secondary – "The tinkerer."** Has an OpenAI or Claude key already, wants to see the AI mode produce plausible corporate prose on demand.
- **Tertiary – "The link-clicker."** Sent the web version by a friend, has no key, wants to press one button and laugh.

---

## 5. Product principles

- **P1 – The joke is that it works.** Every gag is backed by a real, functioning feature.
- **P2 – AI is an enhancement, never a dependency.** Full comedy value with zero keys.
- **P3 – Equal business value.** The local nonsense engine and the AI produce reports of *identical* real-world usefulness (none). This is intentional and load-bearing.
- **P4 – Period-accurate.** Beige, raised borders, navy title bar, MS-Sans-Serif energy, "Y2K Compliant ✓." No modern flat minimalism inside the app window.
- **P5 – Keys are sacred.** A user's API key is encrypted locally, never leaves their machine, never touches the renderer, never appears in a URL.

---

## 6. Features and requirements (v1 scope)

Priority: **P0** = must ship in v1, **P1** = strongly desired in v1, **P2** = v2.

### 6.1 New TPS Report (P0)
- FR-1 – A form with: auto-generated Report ID (`TPS-NNNN`), Author, Department, Date, and a report body.
- FR-2 – A one-line "Describe what happened (we'll write the rest)" input that the user types; it is the **input seed** for generation and is never itself AI-generated.
- FR-2b – Only the report **body** is generated from the seed. The description field and the body are distinct: seed in, body out.
- FR-3 – A **Generate** action that fills the body using the active engine (AI if configured, local otherwise).
- FR-4 – The body is editable after generation.
- FR-4a – A small library of **prewritten sample reports** ships with the app, surfaced on the empty state, so a first-run user can open, read, and share one immediately without generating. Samples cover a range of tones and lean into the film's world (the printer, the stapler, Y2K remediation, "moving the needle").

### 6.2 The Cover Sheet™ (P0)
- FR-5 – "Attach new cover sheet" toggle, **default ON**, labeled "(you got the memo)".
- FR-6 – Toggling it OFF surfaces a persistent yellow Lumbergh nag banner (_"Yeeeah, if you could go ahead and re-attach that new cover sheet, that'd be greeeat."_) that stays visible for as long as the box is unchecked and disappears the moment it's re-checked. No modal—the banner itself is the passive-aggressive feedback loop. When the box is checked, no banner shows (compliant and quiet).
- FR-7 – When ON, exported/printed reports include a generated cover sheet page.
- FR-7a – Print and Export are **gated** on the cover sheet: attempting either with the box unchecked surfaces a Lumbergh gate dialog whose primary action is "Attach cover sheet & continue" (one click re-checks the box and proceeds). No cover-sheet-less export path ships in v1. The gate is near-absolute because it is trivially satisfiable—a gag, not a trap (consistent with FR-6d).

### 6.3 Tone selector – "Lumbergh Mode" (P0)
- FR-8 – A tone dropdown driving the generation style: `Corporate`, `Passive-Aggressive Lumbergh`, `Milton Mumble`, `The Bobs (consultant-speak)`.
- FR-9 – Each tone maps to a distinct backend **system-prompt persona** (Corporate, Lumbergh, Milton, the Bobs) that is prepended to the generation call in AI mode, or to a distinct template/word-bank in local mode. The exact prompt strings and token limits are defined in the design doc.

### 6.4 AI provider settings (P0, desktop only)
- FR-10 – Provider toggle: **OpenAI** or **Claude**.
- FR-11 – A field to enter the API key for the selected provider.
- FR-12 – Key stored encrypted via Electron `safeStorage`; never persisted in plaintext, never sent to the renderer, never logged.
- FR-13 – A **Test connection** button that validates the key and returns flavor text ("Great. Great, great, great.").
- FR-14 – If no key is set, the app runs in local mode with no error state—a clear, non-nagging indicator only.
- FR-15 – All provider calls originate from the Electron **main process** behind a single `LLMProvider` interface (see design doc).

### 6.5 Corporate Nonsense Engine – local fallback (P0)
- FR-16 – A fully offline generator that stitches buzzwords and boilerplate into grammatically valid, semantically empty corporate prose.
- FR-17 – Honors the selected tone via separate word-banks/templates.
- FR-18 – Available on **both** desktop and web builds. Is the *only* engine on web.
- FR-19 – Produces output of a length/shape comparable to AI output (so the two are interchangeable in the UI).

### 6.6 The Bobs Review Mode (P1)
- FR-20 – Submit a finished report and receive an evaluation "from the Bobs."
- FR-21 – Output includes: a consultant-speak critique, the line _"What would you say ya do here?"_, and a verdict badge—one of `Ship it`, `Circle back`, or `…move you down to the basement`.
- FR-22 – In AI mode this is a second `LLMProvider` call with a Bobs persona. In local/web mode it returns a rotating set of canned zingers and a randomized-but-weighted verdict.
- FR-22b – The Bobs will not review a report whose cover sheet is unchecked. Rather than disabling the action, they **deflect in-character** (_"We're gonna need to see a cover sheet before we can, uh, evaluate you here."_) via the same gate dialog and one-click "Attach cover sheet & continue" as FR-7a.
- FR-22a – Verdict weighting is skewed negative, film-accurate: `Circle back` ~55%, `…move you down to the basement` ~35%, `Ship it` ~10%. "Circle back" is the noncommittal consultant hedge and should dominate; "Ship it" is the rare undeserved Peter-style win. (In AI mode, the prompt biases toward these proportions rather than enforcing them exactly.)

### 6.6b "You can't just leave" – close/minimize nag (P1)
- FR-6b – Attempting to close the app with an unfinished/unfiled report shows a Lumbergh dialog with a movie-flavored line (_"I'm gonna need you to go ahead and finish that TPS report before you head out. That'd be greeeat."_) offering `Finish it` or `Close anyway`—always with a real escape hatch. The app never forcibly traps the window.
- FR-6c – When minimized to the system tray with an unfinished/unfiled report, the app nags on an **idle-triggered, escalating, self-limiting** schedule (never while the window is focused):
  - FR-6c.1 – First notification fires only after ~2 minutes of inactivity with an unfinished report (active users are never nagged).
  - FR-6c.2 – Subsequent notifications use a gentle backoff (≈ +5 min, then +10 min), not a fixed short interval, and cycle through progressively more passive-aggressive film-flavored quotes.
  - FR-6c.3 – After ~3 notifications the app stops interrupting and falls back to a silent, persistent tray badge indicating the pending report. This cap is what keeps the gag on the funny side of hostile (see FR-6d).
  - FR-6c.4 – Each notification offers `Finish it` and `Snooze 15 min`.
  - FR-6c.5 – Idle threshold, backoff steps, and cap are configurable; a "quiet mode" toggle in Settings disables nagging entirely.
- FR-6d – Tone stays comedic, not hostile: the guilt-trip is the joke; obstructing the user is not. `Close anyway` must always work.

### 6.7 Export / Print (P0)
- FR-23 – Export the current report to PDF, including the cover sheet page when the toggle is ON.
- FR-24 – Optional flavor: a "PC LOAD LETTER" loading state during export that always resolves successfully.
- FR-25 – Available on both builds (PDF generation is client-side).

### 6.8 Local persistence (P0)
- FR-26 – Reports are saved locally and listed for reopening/editing.
- FR-27 – v1 storage is `electron-store` (JSON) on desktop; the web build persists **drafts and filed reports** to `localStorage` so a refresh keeps work (no key custody, no sensitive data ever stored on web).
- FR-28 – Storage layer is abstracted so it can be swapped to `better-sqlite3` later without touching feature code.

### 6.9 Platform degradation shim (P0)
- FR-29 – The renderer must **feature-detect** the Electron environment and gracefully hide/disable anything desktop-only when running as a plain webpage: provider settings, `safeStorage`, IPC-backed actions, and AI generation.
- FR-30 – On web, the visible surface is: New Report (local engine), Cover Sheet, tone presets, Bobs (canned), and PDF export.
- FR-31 – No web code path may request, accept, store, or transmit an API key.

### 6.10 Flair (P2 – v2)
- FR-32 – Cosmetic achievement system awarding "pieces of flair" for milestones, culminating in the "15 pieces of flair" gag.

### 6.11 Consolidated Memo inbox (P2 – v2)
- FR-33 – A single memo feed replacing the film's eight-bosses redundancy. "You always got the memo."

---

## 7. The two-tier / two-deploy model

One repo, one renderer, two deploys:

| | Web "lite" (GitHub Pages) | Desktop app |
|---|---|---|
| **Distribution** | Static URL, shareable | Downloadable installer (Win/macOS/Linux) |
| **Report engine** | Corporate Nonsense Engine only | AI (BYO key) **or** local engine |
| **API key** | Never requested or handled | Encrypted locally via `safeStorage` |
| **Bobs Review** | Canned zingers | AI-generated critique |
| **Backend** | None | None (main process acts as trusted local backend) |
| **Purpose** | Instant, no-friction comedy version | Full experience |

**Why AI is desktop-only (not a limitation, a boundary):** a static page can't safely hold a user's key—it would sit exposed in the browser, and both OpenAI and Anthropic block browser-origin calls by default. Rather than stand up a key-handling proxy (more infra + a real liability), AI lives on the desktop, where the key is encrypted locally and calls go out from the main process. Web = no-key comedy; desktop = private, local AI.

---

## 8. Security and privacy requirements

- SEC-1 – API keys encrypted at rest via Electron `safeStorage`; never stored in plaintext.
- SEC-2 – Keys never exposed to the renderer process; all provider calls made from main.
- SEC-3 – Keys never placed in URLs, query strings, logs, or telemetry.
- SEC-4 – The web build has **no** code path that accepts or transmits a key (FR-31).
- SEC-5 – No analytics/telemetry that transmits report content or keys off-device in v1.
- SEC-6 – Report content sent to a provider only when the user explicitly triggers AI generation, and only to the provider they selected.

---

## 9. Technical constraints (informing, not prescribing – full detail in design doc)

- TC-1 – Electron + electron-vite + React + TypeScript.
- TC-2 – Renderer is a portable web app; Electron features accessed only via a feature-detected shim.
- TC-3 – Single `LLMProvider` interface with `OpenAIProvider` and `ClaudeProvider` implementations.
- TC-4 – Model identifiers to be confirmed at implementation time (they rotate; do not hardcode stale ones).
- TC-5 – Retro styling uses **98.css** as the base kit (chosen for authentic Win98 chrome with minimal effort), with light custom overrides for Initech-specific flavor (title-bar text, memo banner, status bar).
- TC-6 – PDF generation must be client-side (works on web).

---

## 10. Primary user flows

**Flow A – Generate a report (desktop, AI configured)**
1. User opens New Report → types a one-line description → selects a tone.
2. Clicks Generate → main process calls the selected provider → body fills.
3. Cover sheet is already ON (per the memo). User exports to PDF.

**Flow B – Generate a report (web / no key)**
1. User opens the Pages URL → New Report → one-line description → tone.
2. Clicks Generate → local Corporate Nonsense Engine fills the body.
3. Exports to PDF. No key ever requested.

**Flow C – The Bobs Review**
1. User opens a finished report → clicks "Send to the Bobs."
2. Receives critique + "What would you say ya do here?" + verdict badge.

**Flow D – First-run, no key (desktop)**
1. App opens in local mode with a calm indicator ("AI: off – using the Nonsense Engine").
2. Everything works. User may optionally open Settings to add a key later.

---

## 11. Success metrics (tongue-in-cheek, but real)

- M1 – A user can produce and export a complete, cover-sheeted report in under 60 seconds with no configuration.
- M2 – Local and AI outputs are indistinguishable in *business value* (target: 0 for both). ✔ by design.
- M3 – Web version loads and generates with zero setup and zero key prompts.
- M4 – At least one person screenshots a generated report and sends it to a coworker unprompted.
- M5 – Zero API keys ever leave a user's machine improperly.

---

## 12. Out of scope for v1 (candidate v2+)

- Flair / achievements (FR-32)
- Consolidated Memo inbox (FR-33)
- Batch report generation
- SQLite storage backend (interface is ready; swap deferred)
- Cloud sync, accounts, multi-user

---

## 13. Resolved decisions

- RD-1 – **Name:** Initech TPS Report Wizard '99 (final).
- RD-2 – **Sample reports:** ship a small prewritten library on the empty state (FR-4a).
- RD-3 – **Web persistence:** `localStorage` so a refresh keeps drafts (FR-27).
- RD-4 – **Bobs weighting:** film-accurate skew – Circle back ~55%, basement ~35%, Ship it ~10% (FR-22a).
- RD-5 – **Styling:** 98.css base with light Initech overrides (TC-5).

---

## 14. Next steps

1. **Review this PRD** and resolve the open questions in §13.
2. **Create the full mock screen set** (Main, Settings, Bobs Review, empty state, PDF preview) – as the opening artifact of the design phase, since the mocks surface the component tree and platform-shim boundaries the design doc must account for.
3. **Write `design-doc.md`** – architecture, `LLMProvider` interface, storage abstraction, platform shim, build/deploy for both targets – informed by the mocks.
