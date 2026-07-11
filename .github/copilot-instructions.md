# AI assistant configuration

This file contains configuration and guidelines for AI assistants when working on this repository.

## Important notes

**GIT SAFETY:** NEVER force push to any branch. Force pushes can:

- Overwrite remote history and cause data loss.
- Accidentally commit files that should be in .gitignore.
- Invalidate pull requests and break collaboration.

Always use `git push` without `--force` or `--force-with-lease`. If you need to undo work, use `git revert` instead of `git push --force` or `git push --force-with-lease`.

## Documentation references

For detailed information about this project, refer to the following internal documentation:

- **Product requirements:** Review `docs/product-requirements-doc.md` for feature specifications, tone system, cover-sheet behavior, AI provider settings, and export requirements.
- **Design & architecture:** Refer to `docs/design-doc.md` for architecture, service design, IPC contracts, storage abstraction, and security boundaries.
- **UI mockup:** Refer to `docs/ui-mockup.html` for the intended retro Win98-style layout and interactions.
- **Any other related docs:** Refer to any other docs in the `docs/` folder for additional context.

## Repository overview

This is **Initech TPS Report Wizard '99**, a tongue-in-cheek, retro-styled app for generating TPS reports (inspired by the 1999 film _Office Space_). It ships as a cross-platform desktop Electron app and a static web "lite" version that runs entirely without API keys.

### Key components

The application is built with Electron (cross-platform desktop shell), React + TypeScript (frontend UI), and Vite/electron-vite (build tooling). Core features include a one-line seed input that generates a report body via AI (desktop only, user-provided OpenAI or Claude API key) or the offline Corporate Nonsense Engine, a tone selector (Corporate, Lumbergh, Milton, the Bobs), cover-sheet enforcement with a Lumbergh nag banner and gate dialog, Bobs Review mode, local persistence of drafts and filed reports, and PDF export.

### Architecture patterns

The renderer is a portable web app. The desktop main process hosts privileged services (LLMProvider for OpenAI/Claude, safeStorage-backed key storage, electron-store persistence, tray nag scheduler). The renderer communicates with the main process exclusively through IPC via a typed `window.electronAPI` exposed by the preload script by using `contextBridge`. State management uses React Context + useReducer. The web "lite" build disables desktop-only surfaces and uses localStorage for persistence and the Corporate Nonsense Engine for generation.

### Rate limiting and provider limits

Treat provider rate limits as a first-class concern. OpenAI and Claude have their own rate limits and error responses. Implement reasonable concurrency, backoff, and error handling in the main process. The local Corporate Nonsense Engine has no external rate limits.

## Development workflow

Follow these guidelines to maintain code quality and project consistency.

### Issue creation guidelines

When creating a GitHub issue, provide clear descriptions of bugs or feature requests including steps to reproduce, expected vs. actual behavior, platform/OS details (Windows 11, macOS, Linux), build target (desktop vs. web "lite"), and relevant logs or API error responses. For features, describe the user need and proposed solution.

### Commit practices

Write clear, descriptive commit messages that start with a verb. Focus commits on the actual functionality or changes made, not the development process. Reference issue numbers when commits relate to specific GitHub issues. Never auto-commit changes. Always give the user the opportunity to review changes before committing.

When GitHub Copilot substantially authors or edits the changes in a commit, add a trailer crediting it:

```markdown
Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

### Branch management

Create feature branches from main following the pattern `feature/description` or `fix/description`. Keep branches focused on single features or bug fixes.

### Pull request creation guidelines

When creating a pull request, start the title with a verb and include a clear description of changes made, rationale for the approach taken, testing performed (which platforms and build targets were tested, edge cases covered), and any breaking changes or considerations for reviewers.

### Code standards

Follow TypeScript and React best practices with consistent indentation and naming conventions. Use ESLint and Prettier for code formatting consistency. Implement proper error handling and logging throughout the application. Prioritize security (never disable contextIsolation, validate all IPC inputs in the main process). Test across desktop platforms when possible. Use strict TypeScript (`strict: true` in tsconfig.json).

## Electron and desktop development considerations

When working on Electron development tasks, consider these platform-specific requirements.

### Cross-platform compatibility

The application targets Windows, macOS, and Linux as supported desktop platforms. Use platform-specific code paths only when necessary. Package the application by using electron-builder for all platforms.

### Security and IPC communication

Always maintain strict separation between main and renderer processes. Never disable `contextIsolation` or enable `nodeIntegration` in the renderer. Expose only a narrow, typed API on `window.electronAPI` via the preload script by using `contextBridge`. Validate all IPC inputs in main process handlers. Use the invoke/handle pattern for request-response communication and send/on for events. Set Content Security Policy to `default-src 'self'` with minimal exceptions.

### API key management

Store API keys (OpenAI, Claude) encrypted by using Electron's `safeStorage` API. Decrypt keys only in the main process when making API calls. Never log API keys or include them in error output. Validate keys on entry by making a lightweight test request to each provider. No API key may be requested, stored, or transmitted in the web "lite" build.

### Privacy and data handling

All report content and API calls are local to the user's machine. The only network requests are to the selected AI provider (OpenAI or Claude) from the desktop main process. No telemetry, no user accounts, no server-side component. Reports are sent to the AI provider only when the user explicitly triggers AI generation on desktop.

## Formatting rules

This section outlines the essential formatting standards, primarily for documentation.

### Structure and spacing

Add empty newlines after all headings. Add empty newlines before all lists. Never stack headings - always include descriptive text between them that explains what follows. Add an empty newline at the end of the document. All files must end with a newline character.

Sections must not contain only an admonition, code block, image, table, or tab - always include descriptive text after the heading. Always add an empty newline after the opening of an admonition and before the closing of an admonition. Don't add empty newlines after steps in numbered lists.

### Headings and capitalization

Never end headings with colons. Never end a sentence with a colon if what follows next is a heading. Don't use `Introduction` or `Overview` headings since it should be obvious that the body text immediately below the heading 1/title describes what the doc is about.

Use sentence-style capitalization for all headings and bold-style headings (only capitalize the first word and proper nouns).

### Lists and formatting

Avoid excessive use of bulleted lists and numbered lists. For bulleted items with colons, use `:**` not `**:` (for example, `**Item:**`). Align all rows in Markdown tables for readability in source code.
