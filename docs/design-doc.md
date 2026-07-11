# Design Document – Initech TPS Report Wizard '99

| | |
|---|---|
| **Companion to** | `product-requirements-doc.md` (v0.2) |
| **Status** | Draft for review |
| **Version** | 0.1 |
| **Owner** | Josh |
| **Scope** | v1 architecture. References PRD requirement IDs (FR-*, SEC-*, TC-*) throughout. |

> This document defines *how* the app is built. The PRD defines *what* and *why*. Where they disagree, the PRD wins and this doc should be corrected.

---

## 1. Architecture at a glance

One TypeScript codebase, one React renderer, two deploy targets:

```
                    ┌───────────────────────────────────────────┐
                    │                RENDERER (React)             │
                    │  screens · retro UI (98.css) · platform shim│
                    └───────────────┬───────────────┬─────────────┘
                                    │ IPC (desktop) │ direct (web)
                    ┌───────────────▼──────────┐    │
   DESKTOP ONLY →   │      MAIN PROCESS         │    │
                    │  LLMProvider (OpenAI/     │    │
                    │  Claude) · safeStorage ·  │    │
                    │  tray + nag scheduler ·   │    │
                    │  electron-store           │    │
                    └───────────────┬──────────┘    │
                                    │               │
                          ┌─────────▼─────┐   ┌──────▼───────────────┐
                          │ Provider APIs │   │ Local-only services  │
                          │ (key stays in │   │ Corporate Nonsense   │
                          │  main)        │   │ Engine · localStorage│
                          └───────────────┘   └──────────────────────┘
```

The renderer is provider- and platform-agnostic. It calls a single `generate()` / `review()` surface and never knows whether the work happened via AI in the main process or the local engine in-page. This is the seam that lets the same UI ship as both a full desktop app and a key-free web version.

---

## 2. Technology stack (TC-1..TC-6)

| Concern | Choice | Rationale |
|---|---|---|
| Shell | Electron | Cross-platform desktop + a trusted local process for key custody. |
| Build | electron-vite | Fast HMR, separate main/preload/renderer configs, produces a plain web bundle for the Pages target. |
| UI | React + TypeScript | Team fluency; typed IPC contract. |
| Styling | 98.css + light overrides | Authentic Win98 chrome for minimal effort (TC-5). Mock file hand-rolls this; the app uses 98.css proper. |
| Desktop storage | electron-store (JSON) | Trivial for v1; abstracted for a later SQLite swap (FR-28). |
| Web storage | localStorage | Drafts **and filed reports** persist; never keys or sensitive data (FR-27, SEC-4). |
| Key encryption | Electron `safeStorage` | OS-keychain-backed; no third-party dep. Avoids the unmaintained keytar. |
| AI SDKs | `@anthropic-ai/sdk`, `openai` | Official SDKs, called from main only. The Anthropic SDK disables browser use by default, reinforcing the main-process boundary. |
| PDF | HTML → PDF (see §12) | Render the styled HTML template; `webContents.printToPDF()` on desktop, native print / `html2pdf.js` on web. Reuses 98.css for fidelity (FR-25). |
| Packaging | electron-builder | Win/macOS/Linux installers. |

> **Model IDs (TC-4):** never hardcode a single literal in feature code. All model identifiers live in one config object and are confirmed against current docs at build time. Because reports are throwaway corporate prose, the sensible default is a fast/low-cost tier, not the flagship. Example config (verify current IDs at implementation):
> ```ts
> export const MODEL_CONFIG = {
>   claude: { default: "claude-haiku-4-5", quality: "claude-sonnet-5" },
>   openai: { default: "gpt-4o-mini",       quality: "gpt-4o" },
> } as const;
> ```

---

## 3. Process model and IPC boundary (SEC-1..SEC-3)

Three contexts, strict separation:

- **Main** – owns everything privileged: the API key (via `safeStorage`), provider calls, storage, the tray, and the nag scheduler. Node integration on.
- **Preload** – the only bridge. Exposes a *narrow, typed* API on `window.electronAPI` via `contextBridge`. No raw `ipcRenderer`, no Node globals reach the renderer.
- **Renderer** – untrusted-by-design. Never sees the key, never imports an AI SDK, never touches the filesystem. `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.

Typed IPC contract (illustrative):

```ts
// shared/ipc.ts – single source of truth for channel names + payloads
export interface IpcApi {
  generate(req: GenerateRequest): Promise<GenerateResult>;
  reviewWithBobs(req: BobsRequest): Promise<BobsResult>;
  testConnection(p: ProviderConfig): Promise<{ ok: boolean; message: string }>;
  saveKey(p: ProviderConfig, key: string): Promise<void>;   // key crosses IN, never OUT
  getProviderStatus(): Promise<{ provider: Provider | null; hasKey: boolean }>;
  listReports(): Promise<Report[]>;
  saveReport(r: Report): Promise<void>;
  exportPdf(r: Report): Promise<{ path: string }>;
}
```

Rule: `saveKey` accepts a key from the renderer once (the settings field) and immediately hands it to `safeStorage`; no channel ever returns a decrypted key to the renderer (SEC-2). `getProviderStatus` returns only a boolean `hasKey`.

---

## 4. The `LLMProvider` interface (FR-15, TC-3)

A single interface with two implementations. All generation and Bobs-review logic depends on this abstraction, never on a concrete provider.

```ts
export type Provider = "claude" | "openai";

export interface LlmProvider {
  readonly id: Provider;
  complete(input: {
    system: string;
    user: string;
    maxTokens?: number;
  }): Promise<string>;               // returns assembled plain text
  test(): Promise<{ ok: boolean; message: string }>;
}
```

Sketch implementations (main process only):

```ts
class ClaudeProvider implements LlmProvider {
  id = "claude" as const;
  constructor(private key: string, private model: string) {}
  async complete({ system, user, maxTokens = 700 }) {
    const client = new Anthropic({ apiKey: this.key });
    const msg = await client.messages.create({
      model: this.model, max_tokens: maxTokens,
      system, messages: [{ role: "user", content: user }],
    });
    return msg.content.filter(b => b.type === "text").map(b => b.text).join("");
  }
  async test() {
    try {
      // Auth-check only: lists models, spends zero generation tokens (OTQ-5).
      await new Anthropic({ apiKey: this.key }).models.list();
      return { ok: true, message: "Great. Great, great, great." };
    } catch (e) { return { ok: false, message: humanizeError(e) }; }
  }
}

class OpenAiProvider implements LlmProvider {
  id = "openai" as const;
  constructor(private key: string, private model: string) {}
  async complete({ system, user, maxTokens = 700 }) {
    const client = new OpenAI({ apiKey: this.key });
    const res = await client.chat.completions.create({
      model: this.model, max_tokens: maxTokens,
      messages: [{ role: "system", content: system },
                 { role: "user", content: user }],
    });
    return res.choices[0]?.message?.content ?? "";
  }
  async test() {   // client.models.list() – auth-check only, zero tokens (OTQ-5)
    try { await new OpenAI({ apiKey: this.key }).models.list();
      return { ok: true, message: "Great. Great, great, great." }; }
    catch (e) { return { ok: false, message: humanizeError(e) }; }
  }
}
```

A `providerFactory(config, key)` returns the right implementation; callers only ever hold an `LlmProvider`.

---

## 5. Tone system → system-prompt personas (FR-8, FR-9)

Tone is the single knob that changes generation voice. Each tone maps to a system prompt (AI mode) *and* a word-bank/template set (local mode), keyed identically so the two engines stay interchangeable.

```ts
export type Tone = "corporate" | "lumbergh" | "milton" | "bobs";

export const TONE_PROMPTS: Record<Tone, string> = {
  corporate:
    "You are an enterprise middle-manager writing a TPS report body. Use maximal " +
    "corporate jargon (synergy, circle back, socialize, action items, move the needle). " +
    "Sound authoritative while saying nothing of substance. 2–3 short paragraphs. No preamble.",
  lumbergh:
    "You are Bill Lumbergh writing a TPS report body. Mild, drawn-out, passive-aggressive. " +
    "Frame everything as a gentle imposition ('if you could go ahead and…'). Work in a " +
    "reference to cover sheets and coming in on Saturday. 2–3 short paragraphs. No preamble.",
  milton:
    "You are Milton Waddams writing a TPS report body. Low, mumbling, quietly resentful, " +
    "trailing off. Fixate on your red stapler and being moved to the basement. Mention you " +
    "were told you could listen to the radio at a reasonable volume. 2–3 short paragraphs.",
  bobs:
    "You are two management consultants (both named Bob) drafting a report body that mostly " +
    "questions whether the work justifies the author's existence. 2–3 short paragraphs.",
};
```

The generation call composes: `system = BASE_REPORT_SYSTEM + "\n\n" + TONE_PROMPTS[tone]`, `user = userSeed`. `BASE_REPORT_SYSTEM` pins format constraints (length, no markdown headers, plain prose) so every tone yields a fileable-looking body. Prompt strings live in one module and are treated as product copy, versioned with the app.

Generation flow (FR-2, FR-3): the **seed** (user's one-liner) is the `user` message; only the **body** is produced (FR-2b). The description field is never generated.

---

## 6. Corporate Nonsense Engine – local fallback (FR-16..FR-19)

A fully offline generator that produces grammatically valid, semantically empty prose. It is the *only* engine on web and the no-key engine on desktop. Design goals: deterministic-enough to feel authored, varied-enough not to repeat, and shaped like AI output so the two are swappable.

```ts
interface NonsenseEngine {
  generateBody(seed: string, tone: Tone): string;   // mirrors LlmProvider output shape
  bobsZinger(): { critique: string; verdict: Verdict };
}
```

Approach: a small grammar of sentence templates per tone, each with slots filled from tone-specific word-banks (verbs, nouns, buzz-phrases). The `seed` is woven in as a subject noun-phrase so the output nods at the user's input without meaning anything. Output length is normalized to the same 2–3 paragraph target as AI mode (FR-19). No network, no dependencies.

The two engines sit behind a common `ReportEngine` facade the renderer calls, so screen code never branches on "AI vs local":

```ts
interface ReportEngine {
  generate(seed: string, tone: Tone): Promise<string>;
  review(report: Report): Promise<BobsResult>;
}
// AiReportEngine → IPC → LlmProvider ;  LocalReportEngine → NonsenseEngine (in-renderer)
```

---

## 7. The Bobs Review (FR-20..FR-22a)

Same plumbing as generation, different persona and a verdict.

```ts
export type Verdict = "circle_back" | "basement" | "ship_it";

export interface BobsResult {
  critique: string;      // consultant-speak paragraph
  question: string;      // always "So… what would you say ya do here?"
  verdict: Verdict;
}
```

- **AI mode:** one `LlmProvider.complete()` call with a Bobs system prompt that asks for a critique and then names a verdict; the app parses the verdict token and biases the prompt toward the target distribution (FR-22a) rather than trusting the model to hit exact odds.
- **Local/web mode:** `bobsZinger()` returns a canned critique plus a weighted-random verdict.

Verdict weighting (FR-22a) is one shared function so both modes agree:

```ts
function rollVerdict(r = Math.random()): Verdict {
  if (r < 0.55) return "circle_back";   // dominant hedge
  if (r < 0.90) return "basement";       // the Milton fate
  return "ship_it";                      // rare undeserved win
}
```

---

## 8. Storage abstraction and data model (FR-26..FR-28)

One interface, swappable backends.

```ts
export interface ReportStore {
  list(): Promise<Report[]>;
  get(id: string): Promise<Report | null>;
  save(r: Report): Promise<void>;
  remove(id: string): Promise<void>;
}
// ElectronStoreBackend (desktop, v1) · LocalStorageBackend (web) · SqliteBackend (v2, FR-28)
```

Data model:

```ts
export interface Report {
  id: string;                 // "TPS-0042"
  author: string;
  department: string;
  date: string;               // display string; the joke allows "Friday (feels like Monday)"
  seed: string;               // user input
  body: string;               // generated output
  tone: Tone;
  coverSheet: boolean;        // default true (FR-5)
  status: "draft" | "filed";  // drives the close/idle nag (FR-6b, FR-6c)
  createdAt: number;
  updatedAt: number;
}
```

`status` is load-bearing for the nag logic: only a `draft` is "unfinished." Filing a report clears it from the nag queue.

Sample reports (FR-4a) ship as a static seed array the store lazy-loads on first run when `list()` is empty.

On web, the `LocalStorageBackend` persists **both drafts and filed reports** (OTQ-3, FR-27); only keys and other sensitive data are excluded (there are none on web anyway).

---

## 9. Platform shim – web vs desktop (FR-29..FR-31, SEC-4)

A single detection point, everything else keys off it.

```ts
export const isDesktop = typeof window !== "undefined" && !!window.electronAPI;

export function makeReportEngine(): ReportEngine {
  return isDesktop && hasKeySelected()
    ? new AiReportEngine(window.electronAPI)   // IPC → main → LlmProvider
    : new LocalReportEngine(nonsenseEngine);   // in-renderer, no key
}
```

Rules enforced by the shim:

- Settings/provider UI (FR-10..FR-15) renders **only** when `isDesktop`. On web it is not in the tree at all—not merely hidden (SEC-4, FR-31).
- Tray, nag scheduler, PDF-to-disk, and `safeStorage` are main-process features; the web build has no code path to them.
- The web build has no import of any AI SDK and no field that accepts a key (SEC-4).

electron-vite emits two bundles from the same source: the full app and a `web`-mode renderer where `window.electronAPI` is absent, so `isDesktop` is `false` and the app degrades to local-only automatically.

---

## 10. Security model (SEC-1..SEC-6)

- Key enters once via the settings field → `saveKey` IPC → `safeStorage.encryptString` → stored ciphertext. Decrypted only in-memory in main at call time (SEC-1, SEC-2).
- No IPC channel returns a decrypted key; renderer sees only `hasKey: boolean` (SEC-2).
- Keys never placed in URLs, query strings, logs, or telemetry (SEC-3). Provider errors are humanized before crossing IPC so raw responses (which can echo request context) don't leak.
- Web build cannot handle a key at all (SEC-4).
- No telemetry transmits report content or keys in v1 (SEC-5).
- Report content leaves the machine only on an explicit Generate/Review in AI mode, and only to the selected provider (SEC-6).

---

## 11. The nag subsystem (FR-6, FR-6b..FR-6d, FR-6c.1..FR-6c.5)

Three related but distinct behaviors:

**11.1 Cover-sheet nag (FR-6, renderer).** Pure UI state: `coverSheet === false` renders the yellow Lumbergh banner; re-checking hides it. No timers, no modal.

**11.2 Close attempt (FR-6b, main).** Intercept `close`; if any report is `draft`, show a Lumbergh dialog with `Finish it` / `Close anyway`. `Close anyway` always quits (FR-6d)—the guardrail is absolute.

**11.3 Idle nag scheduler (FR-6c, main).** A small state machine, active only while minimized-to-tray with a `draft` present. Focused window ⇒ disabled.

```
        ┌── window focused / no draft ──►  IDLE (no timers)
        │
tray + draft present
        │
        ▼
   ARMED ──(2 min inactivity, FR-6c.1)──► NAG#1 ──(+5 min)──► NAG#2 ──(+10 min)──► NAG#3
        │                                    │                                        │
        │ user activity / report filed       │ Snooze 15m → re-arm timer              ▼
        ◄────────────────────────────────────┘                              SILENT BADGE (FR-6c.3)
                                                                          (persistent tray dot, no popups)
```

- Backoff steps, idle threshold, and cap are config constants (FR-6c.5); a **quiet-mode** toggle in Settings short-circuits the machine to `IDLE`.
- Each notification carries `Finish it` (restore window, focus body) and `Snooze 15m` (re-arm) actions (FR-6c.4).
- Quote ladder is a config array indexed by nag count; after index 2 the machine transitions to `SILENT BADGE` (FR-6c.3)—the cap that keeps it a joke, not an attack.
- "Inactivity" = no input to the renderer *and* no window focus; tracked via a lightweight activity ping from renderer to main, debounced.

**11.4 Per-OS tray metaphor (OTQ-4).** Electron's `Tray` maps to a system tray on Windows/Linux and to a **menu bar extra (NSStatusItem)** on macOS via the same code path, so "minimize to tray" reads correctly on each OS with one abstraction. macOS lifecycle differs and is handled explicitly: the app does **not** quit when its window closes (it persists in the menu bar / Dock; `app.quit()` only on explicit Quit), nags are delivered through Notification Center, and a Dock badge can show the pending-report count. Verified current for macOS 26 (Tahoe)—the only 26-era difference is Liquid Glass styling if we ever draw a custom menu-bar popover.

---

## 12. PDF / cover sheet generation (FR-23..FR-25, OTQ-1)

**Approach: HTML → PDF, not hand-drawn.** The output is meant to look like the retro Print Preview screen, which is already HTML/CSS. So we render a styled HTML template (cover sheet page + body page, reusing the 98.css/print styles) and let the platform turn it into a PDF—real vector text, pixel-parity with the app, almost no layout math.

- **Desktop:** Electron `webContents.printToPDF()` on an offscreen `BrowserWindow` loaded with the report template. Honors CSS including `@page` breaks; writes to a user-chosen path (the save-location prompt is an *explicit permission* action—the user picks where).
- **Web:** native `window.print()` → "Save as PDF" against a print stylesheet; `html2pdf.js` is the fallback if we want a silent programmatic download instead of the OS print dialog.

The cover sheet page is included only when `report.coverSheet` is true. The "PC LOAD LETTER" state (FR-24) is a fixed-duration cosmetic delay that always resolves. (Considered pdf-lib/jsPDF hand-drawing and rejected it: the content is flowing prose that wraps, and we'd be re-implementing the retro layout by hand instead of reusing the CSS.)

**Cover-sheet gate (FR-7a, FR-22b).** Print, Export, and Bobs-review share one precondition check, `requireCoverSheet(report, onProceed)`, enforced in the renderer before any of those actions run. If `report.coverSheet` is false it opens the gate dialog; the "Attach cover sheet & continue" action sets `coverSheet = true`, persists, and invokes the original `onProceed`. Because it's a single shared guard, the three call sites stay consistent and a future gated action (e.g. "file report") reuses it.

---

## 13. Project structure (proposed)

```
src/
  main/            # Electron main: providers, safeStorage, tray, nag scheduler, store
    providers/     # claude.ts, openai.ts, factory.ts
    nag/           # scheduler state machine
    store/         # electron-store backend
    ipc.ts         # handlers wired to shared/ipc.ts
  preload/         # contextBridge → window.electronAPI (narrow, typed)
  renderer/        # React app
    screens/       # Main, Empty, Settings, Bobs, PrintPreview
    engine/        # ReportEngine facade, LocalReportEngine, nonsense/
    platform/      # isDesktop shim
    ui/            # 98.css overrides, retro components
  shared/          # ipc.ts, types.ts, tone-prompts.ts, model-config.ts, verdict.ts
samples/           # seeded sample reports (FR-4a)
```

Shared modules (types, tone prompts, verdict roll, model config) are imported by both main and renderer so the two engines can't drift.

---

## 14. Build & deploy (§7 of PRD)

- **Desktop:** electron-builder → signed installers for Win/macOS/Linux. AI mode enabled.
- **Web lite:** electron-vite `web` build → static `dist/` → GitHub Pages. Local engine only, no key, no backend. CI builds both from one commit; a single `VITE_TARGET` flag selects the renderer entry that omits desktop-only modules.

---

## 15. Error handling

- Provider/network failures surface as in-character, humanized messages ("The Bobs are in a meeting. Try again."), never raw stack traces or API bodies (SEC-3).
- No key + AI action attempted ⇒ silently route to local engine; never an error state (FR-14).
- Storage write failures degrade to in-memory with a non-blocking notice; a joke app must never lose the user's (worthless) work loudly.

---

## 16. Testing strategy

- **Unit:** `rollVerdict` distribution (statistical bounds), tone-prompt composition, nonsense-engine output shape/length, nag state-machine transitions (with a fake clock).
- **Contract:** IPC payloads typecheck against `shared/ipc.ts`; a test asserts no channel returns a key field.
- **Platform:** a `web`-target render asserts the Settings screen and any AI-SDK import are absent from the bundle (guards SEC-4/FR-31).
- **Manual/mock:** the existing `ui-mockup.html` remains the visual reference for screen parity.

---

## 17. Deferred / v2 (from PRD §12)

Flair (FR-32), consolidated Memo inbox (FR-33), batch generation, and the SQLite backend (interface ready per FR-28). None require re-architecting: Flair and Memo are renderer features; the ledger is a new main-process store implementation behind `ReportStore` plus a contract layer; SQLite is a drop-in `ReportStore`.

---

## 18. Resolved technical decisions

- OTD-1 (was OTQ-1) – **PDF: HTML → PDF**, not hand-drawn. `webContents.printToPDF()` on desktop; native print / `html2pdf.js` on web. Reuses 98.css for fidelity. See §12.
- OTD-2 (was OTQ-2) – **Nonsense engine: template grammar** (not Markov). More controllable and funnier. See §6.
- OTD-3 (was OTQ-3) – **Web persists drafts and filed reports** to localStorage. See §8, FR-27.
- OTD-4 (was OTQ-4) – **Tray: one `Tray` abstraction**, rendering as a menu bar extra on macOS and a system tray on Windows/Linux; macOS app persists on window close, nags via Notification Center, Dock badge for count. Verified for macOS 26. See §11.4.
- OTD-5 (was OTQ-5) – **`testConnection` calls `client.models.list()`** on each provider—authenticates the key, spends zero generation tokens. See §4.
