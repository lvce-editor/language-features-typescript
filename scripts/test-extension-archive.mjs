import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { brotliDecompressSync } from 'node:zlib'

const archive = brotliDecompressSync(readFileSync('extension.tar.br'))
const entries = execFileSync('tar', ['-tf', '-'], { input: archive, encoding: 'utf8' }).split(/\r?\n/)
assert(entries.some((entry) => entry.endsWith('/extension.json') || entry === 'extension.json'))
assert(
  !entries.some((entry) => /(?:^|\/)(?:tsc|tsgo|tsserver)(?:\.exe)?$/.test(entry)),
  'Native TypeScript server must be bundled by the application',
)
assert(!entries.some((entry) => entry.includes('/language-servers/')))
console.log('Extension archive contains no native TypeScript server')
