// Copies the built renderer (the platform-agnostic static site) out of the
// electron-vite `out/` directory into `dist-web/`, which is what actually
// gets published as the web "lite" version (e.g. GitHub Pages). The main and
// preload bundles under `out/` are desktop-only and are not part of this
// artifact.
import { cpSync, existsSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')
const source = resolve(projectRoot, 'out/renderer')
const destination = resolve(projectRoot, 'dist-web')

if (!existsSync(source)) {
  console.error('Expected build output at out/renderer — run `electron-vite build` first.')
  process.exit(1)
}

rmSync(destination, { recursive: true, force: true })
cpSync(source, destination, { recursive: true })

console.log(`Web "lite" build ready at ${destination}`)
