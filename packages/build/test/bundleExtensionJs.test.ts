import { expect, test } from '@jest/globals'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { bundleExtensionJs } from '../src/bundleExtensionJs.ts'

test('extension bundling strips nested generic constructor arguments', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'typescript-extension-bundle-'))
  try {
    const input = join(directory, 'input.ts')
    const output = join(directory, 'output.js')
    await writeFile(input, 'interface Entry<T> {value: T}; export const create = <T>() => new Map<string, Entry<T>>();')
    // Rollup parsing itself rejects leftover TypeScript constructor arguments.
    await bundleExtensionJs(input, output)
    expect(await readFile(output, 'utf8')).toContain('new Map()')
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
