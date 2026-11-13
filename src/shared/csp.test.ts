import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, it } from 'vitest'
import { buildContentSecurityPolicy } from './csp'

function scriptSrc(policy: string): string {
  const directive = policy.split(';').find((d) => d.trim().startsWith('script-src'))
  return directive?.trim() ?? ''
}

describe('buildContentSecurityPolicy', () => {
  it('keeps script-src strict in production', () => {
    const policy = buildContentSecurityPolicy(false)
    expect(scriptSrc(policy)).toBe("script-src 'self'")
    expect(policy).not.toMatch(/script-src[^;]*'unsafe-(inline|eval)'/)
  })

  it('allows inline scripts only in development', () => {
    expect(scriptSrc(buildContentSecurityPolicy(true))).toBe("script-src 'self' 'unsafe-inline'")
  })

  it('differs between environments only in script-src', () => {
    const strip = (p: string): string => p.replace(/script-src[^;]*/, '')
    expect(strip(buildContentSecurityPolicy(true))).toBe(strip(buildContentSecurityPolicy(false)))
  })

  it('matches the production <meta> policy in index.html', () => {
    const html = readFileSync(resolve(__dirname, '../renderer/index.html'), 'utf8')
    const meta = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/)
    expect(meta?.[1]).toBe(buildContentSecurityPolicy(false))
  })
})
