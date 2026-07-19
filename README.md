# Initech TPS Report Wizard 99

A tongue-in-cheek, retro-styled app for generating TPS reports. **Fan project inspired by the 1999 film Office Space**, where TPS reports are a running joke. Ships as a desktop Electron app and a static web "lite" version that runs entirely without keys.

## Key features

- **Core workflow:** Seed a report with a one-line description, generate the body (AI or local), edit the result, attach the cover sheet, and export to PDF.
- **Desktop (Electron):** Optional AI providers (OpenAI or Claude); API keys stored locally and encrypted.
- **Web "lite":** Static version that uses the local Corporate Nonsense Engine—no AI functionality.
- **Tones:** Presets include Lumbergh, Milton, and the Bobs to control voice/style.
- **Cover sheet enforcement:** Cover sheet is ON by default; export and reviews require attaching it (the joke).
- **Persistence:** Local drafts and filed reports are saved for reopening.
- **Export:** PDF export supported on desktop and web builds.

## Development docs

- **Product requirements:** [docs/product-requirements-doc.md](docs/product-requirements-doc.md)
- **Design & architecture:** [docs/design-doc.md](docs/design-doc.md)
- **UI mockup:** [docs/ui-mockup.html](docs/ui-mockup.html)

## Getting started

The app is built with Electron, electron-vite, React, and TypeScript, and shares one codebase between the desktop build and the static web "lite" build.

```sh
npm install
npm run dev
```

`npm run dev` launches the desktop app. The same renderer dev server URL it prints can also be opened directly in a regular browser tab to preview the web "lite" experience, since `window.electronAPI` (and therefore desktop-only functionality) is only present inside Electron.

### Build scripts

- `npm run build`: typechecks and builds the desktop app via electron-builder.
- `npm run build:web`: builds the renderer and copies the platform-agnostic static bundle to `dist-web/` for deployment (for example, to GitHub Pages).
- `npm run lint` / `npm run format`: ESLint and Prettier for `src/` and the project config files.
- `npm run typecheck`: strict TypeScript checks for both the main/preload and renderer contexts.

## Contributing

Please open issues or pull requests for ideas, bugs, or enhancements.

## License

See [LICENSE](LICENSE).
