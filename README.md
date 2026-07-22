# 🧾 TPS Report Wizard 99

TPS Report Wizard 99 is a tongue-in-cheek, retro-styled app for generating TPS reports. **Fan project inspired by the 1999 film Office Space**, where TPS reports are a running joke. The app runs as a desktop Electron app that supports AI-generated responses and a static web "lite" version that runs entirely without AI.

> [!IMPORTANT]
>
> This app was built for fun and is not affiliated with or endorsed by the creators of Office Space.

## 💭 Why "TPS Report Wizard 99"?

I wanted a fun way of thinking of product development from another angle. I enjoy automating things, and I had the idea that automating TPS reports could be something the cast of Office Space would have appreciated. The app is a playful take on the idea of automating mundane office tasks, and it serves as a reminder that even in a world of automation, human creativity and humor still have a place.

## ✨ Key features

- **Core workflow:** Seed a report with a one-line description, generate the body (AI or local), edit the result, attach the cover sheet, and export to PDF.
- **Desktop (Electron):** Optional AI providers (OpenAI or Claude); API keys stored locally and encrypted.
- **Web "lite":** Static version that uses the local Corporate Nonsense Engine—no AI functionality.
- **Authors:** Choose the report's voice from seven characters (Peter Gibbons, Bill Lumbergh, Milton Waddams, Michael Bolton, Samir Nagheenanajar, Joanna, and Tom Smykowski); the Bobs appear only as reviewers in Bobs Review mode.
- **Cover sheet enforcement:** Cover sheet is ON by default; export and reviews require attaching it (the joke).
- **Bobs Review mode:** Optional mode that simulates the Bobs reviewing your report, with feedback and suggestions.
- **Export:** PDF export supported on desktop and web builds.
- **Persistence:** Local drafts and filed reports are saved for reopening.

## 📦 Download and install

Download and install the Electron app for your platform:

1. Go to [Releases](https://github.com/josh-wong/tps-report-wizard/releases).
2. Download the installer for your OS:
   - **Windows:** `tps-report-wizard-*.exe`
   - **macOS:** `tps-report-wizard-*.dmg`
   - **Linux:** `tps-report-wizard_*_amd64.deb` or `tps-report-wizard-*.AppImage`
3. Run the installer and follow the prompts.

> [!NOTE]
>
> - **Windows:** SmartScreen may warn that the app is unrecognized. Click "More info" and select "Run anyway" to proceed.
> - **macOS:** When you first try to open the app, a security dialog will appear asking if you want to run it. Click "Open" to proceed. If the dialog doesn't appear, open "System Settings", select "Privacy & Security", find the app in the list, and click "Open" to allow it to run.

## 🌐 Web "lite" version

Use the app entirely in your browser without installation or API keys by visiting the live web "lite" version at https://tps.080f53.com.

## Development

The app is built with Electron, electron-vite, React, and TypeScript, and shares one codebase between the desktop build and the static web "lite" build.

To set up your development environment:

```sh
npm install
npm run dev
```

`npm run dev` launches the desktop app in development mode. The renderer dev server URL it prints can also be opened directly in a regular browser tab to preview the web "lite" experience, since `window.electronAPI` (and therefore desktop-only functionality) is only present inside Electron.

### Build scripts

- `npm run build`: typechecks and builds the desktop app via electron-builder.
- `npm run build:web`: builds the renderer and copies the platform-agnostic static bundle to `dist-web/` for deployment (for example, to GitHub Pages).
- `npm run lint` / `npm run format`: ESLint and Prettier for `src/` and the project config files.
- `npm run typecheck`: strict TypeScript checks for both the main/preload and renderer contexts.

## Reference - Development docs

- **Product requirements:** [docs/product-requirements-doc.md](docs/product-requirements-doc.md)
- **Design & architecture:** [docs/design-doc.md](docs/design-doc.md)
- **UI mockup:** [docs/ui-mockup.html](docs/ui-mockup.html)

## Contributing

Please open issues or pull requests for ideas, bugs, or enhancements.

## License

See [LICENSE](LICENSE).
