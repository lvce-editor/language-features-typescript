import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, test } from '@jest/globals'
import { copyExtensionSchemas } from '../src/copyExtensionSchemas.ts'

test('copyExtensionSchemas copies every schema into the packaged extension', async () => {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'language-features-typescript-build-'))
  const extensionPath = join(temporaryDirectory, 'extension')
  const distPath = join(temporaryDirectory, 'dist')
  const schemas = {
    'jsconfig.schema.json': '{"title":"jsconfig"}',
    'package.schema.json': '{"title":"package"}',
    'tsconfig.schema.json': '{"title":"tsconfig"}',
  }

  try {
    await mkdir(join(extensionPath, 'schemas'), { recursive: true })
    await Promise.all(
      Object.entries(schemas).map(([name, content]) => writeFile(join(extensionPath, 'schemas', name), content)),
    )

    await copyExtensionSchemas(extensionPath, distPath)

    await expect(
      Promise.all(Object.keys(schemas).map((name) => readFile(join(distPath, 'schemas', name), 'utf8'))),
    ).resolves.toEqual(Object.values(schemas))
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true })
  }
})
