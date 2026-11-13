import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { buildContentSecurityPolicy } from './src/shared/csp'

// Dev server only: swap the strict <meta> CSP in index.html for the dev policy
// that allows the React Fast Refresh preamble. Builds keep the strict policy.
const devCsp = {
  name: 'dev-csp',
  apply: 'serve' as const,
  transformIndexHtml: (html: string): string =>
    html.replace(buildContentSecurityPolicy(false), buildContentSecurityPolicy(true))
}

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@shared': resolve('src/shared')
      }
    }
  },
  preload: {
    resolve: {
      alias: {
        '@shared': resolve('src/shared')
      }
    }
  },
  renderer: {
    // Relative base so the same renderer bundle works from a GitHub Pages
    // project subpath (web "lite" build) as well as from the packaged app.
    base: './',
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared')
      }
    },
    plugins: [react(), devCsp]
  }
})
