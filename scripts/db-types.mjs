// Regenerates types/supabase.ts from the live schema. Needs SUPABASE_ACCESS_TOKEN in .env.local.
// Usage: npm run db:types
import fs from 'node:fs'

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const ref = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0]
const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/types/typescript?included_schemas=public`, {
  headers: { Authorization: `Bearer ${env.SUPABASE_ACCESS_TOKEN}` },
})
if (!res.ok) {
  console.error('Type generation failed:', res.status, await res.text())
  process.exit(1)
}
const { types } = await res.json()
fs.writeFileSync('types/supabase.ts', '// Generated from the live schema by `npm run db:types`. Do not edit by hand.\n' + types)
console.log('types/supabase.ts updated')
