import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from '@jest/globals'
import { getTypeScriptLibManifest } from '../src/getTypeScriptLibManifest.ts'

describe('getTypeScriptLibManifest', () => {
  it('creates a stable content hash for declaration files and changes it when file content changes', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'typescript-lib-manifest-'))
    try {
      await mkdir(join(directory, 'en'), { recursive: true })
      await writeFile(join(directory, 'lib.d.ts'), 'declare const a: string')
      await writeFile(join(directory, 'lib.dom.d.ts'), 'declare const b: string')
      await writeFile(join(directory, 'typescript.d.ts'), 'pruned in packaged builds')
      await writeFile(join(directory, 'lib.js'), 'ignored')
      await writeFile(join(directory, 'en', 'diagnosticMessages.generated.json'), '{}')

      const before = await getTypeScriptLibManifest(directory)
      const repeated = await getTypeScriptLibManifest(directory)
      await writeFile(join(directory, 'lib.dom.d.ts'), 'declare const c: string')
      const after = await getTypeScriptLibManifest(directory)

      expect(before).toEqual(repeated)
      expect(before.files.map((file) => file.fileName)).toEqual(['lib.d.ts', 'lib.dom.d.ts'])
      expect(before.hash).not.toBe(after.hash)
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})
