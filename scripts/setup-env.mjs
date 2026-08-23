#!/usr/bin/env node
/**
 * Paste the firebaseConfig block from the Firebase console straight into this
 * script and it writes .env.local for you:
 *
 *   npm run setup:env
 *   ...paste, then press Ctrl-D
 *
 * Accepts the whole `const firebaseConfig = { ... };` snippet or just the
 * object -- it reads the keys out either way.
 */
import { writeFileSync, existsSync, copyFileSync } from 'node:fs'

const FIELDS = {
  apiKey: 'VITE_FB_API_KEY',
  authDomain: 'VITE_FB_AUTH_DOMAIN',
  projectId: 'VITE_FB_PROJECT_ID',
  storageBucket: 'VITE_FB_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FB_SENDER_ID',
  appId: 'VITE_FB_APP_ID',
}

const input = await new Promise((resolve) => {
  let buf = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', (c) => { buf += c })
  process.stdin.on('end', () => resolve(buf))
})

// Pull "key: value" pairs out rather than eval-ing whatever was pasted.
const found = {}
for (const key of Object.keys(FIELDS)) {
  const m = input.match(new RegExp(`${key}\\s*:\\s*["'\`]([^"'\`]*)["'\`]`))
  if (m) found[key] = m[1]
}

const missing = Object.keys(FIELDS).filter((k) => !found[k])
if (missing.length === Object.keys(FIELDS).length) {
  console.error('Could not find any config values in that. Paste the whole firebaseConfig block.')
  process.exit(1)
}
if (missing.length) console.warn(`Warning: no value found for ${missing.join(', ')}`)

if (existsSync('.env.local')) copyFileSync('.env.local', '.env.local.bak')

const body = Object.entries(FIELDS).map(([key, env]) => `${env}=${found[key] ?? ''}`).join('\n')
writeFileSync('.env.local', body + '\n')

console.log('Wrote .env.local:')
console.log(`  project: ${found.projectId}`)
console.log('\nRestart the dev server -- Vite only reads env files at startup.')
