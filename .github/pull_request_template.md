## Summary

<!-- Brief description of what this PR accomplishes, starting with "This PR ..." -->

## Related issues or PRs

<!-- Use format: Resolves #123, Relates to #456. If none exist, write "N/A" -->
-

## Changes made

<!-- List specific changes with bullet points -->
-
-
-

## Technical implementation

<!-- Describe architectural decisions, patterns used, etc. -->
- **Approach:**
- **Key components modified:**
- **Dependencies added/removed:**
- **Design patterns used:**

## Testing performed

<!-- Mark completed testing with [x]. Add PR-specific items as needed. -->
- [ ] Unit tests pass
- [ ] Integration tests pass (if applicable)
- [ ] Desktop app tested on the target platform(s)
- [ ] Web "lite" version tested in a browser
- [ ] Local Corporate Nonsense Engine generates valid report bodies for all tones
- [ ] AI generation tested with the selected provider (desktop only, if applicable)
- [ ] Cover sheet toggle, gate dialog, and PDF export tested
- [ ] Bobs Review flow tested (AI and/or canned mode)
- [ ] Report persistence tested (electron-store on desktop, localStorage on web)
- [ ] Edge cases and error handling tested (empty seed, invalid API key, missing cover sheet, export failures)
- [ ] Cross-platform UI checks (Win / macOS / Linux where applicable)
- [ ] No API keys or credentials committed in code or tests

## API and data considerations

<!-- Mark applicable items with [x]. Add PR-specific notes. -->
- [ ] No API keys or credentials in code or tests
- [ ] Environment variables used for all secrets and config
- [ ] API error handling and fallback behavior implemented
- [ ] AI provider calls originate from the main process only (desktop)
- [ ] Web build has no code path that accepts or transmits an API key
- [ ] No user data retained beyond the current request
- [ ] No new dependencies with known vulnerabilities

## Code quality

<!-- Verify these items -->
- [ ] Code follows project conventions (TypeScript strict, ESLint, Prettier)
- [ ] Linting and formatting pass with no errors
- [ ] Added appropriate comments for complex logic
- [ ] No hardcoded secrets or API keys
- [ ] Proper error handling and user-friendly error messages
- [ ] No debugging code or console statements left in
- [ ] Removed unused imports, variables, and functions
- [ ] Dependencies pinned to specific versions
- [ ] Documentation updated (README, PRD, design doc, or UI mockup if applicable)

## Breaking changes

<!-- Does this PR introduce breaking changes to the public API, CLI interface, or output format? -->
- [ ] No breaking changes
- [ ] Breaking changes (describe below):

## Additional context

<!-- Any extra information for reviewers, screenshots, performance notes, etc. -->
