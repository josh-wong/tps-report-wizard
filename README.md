# Initech TPS Report Wizard '99

A tongue-in-cheek, retro-styled app for generating TPS reports (inspired by the 1999 film Office Space, where TPS reports are a running joke). Ships as a desktop Electron app and a static web "lite" version that runs entirely without keys.

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

## Contributing

Please open issues or pull requests for ideas, bugs, or enhancements.

## License

See [LICENSE](LICENSE).
