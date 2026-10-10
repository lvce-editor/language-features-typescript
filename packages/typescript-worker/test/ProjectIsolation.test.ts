import { afterEach, expect, jest, test } from '@jest/globals'
import * as ts from 'typescript'
import { createCachedClient } from '../src/parts/CachedFileClient/CachedFileClient.ts'
import { createFileSystem } from '../src/parts/CreateFileSystem/CreateFileSystem.ts'
import * as LanguageServices from '../src/parts/LanguageServices/LanguageServices.ts'

jest.unstable_mockModule('../src/parts/ReadLibFile/ReadLibFile.ts', () => ({ readLibFile: () => undefined }))
const { collectIdleProjects, getOrCreateLanguageService, getProjectCount, resetLanguageServices } =
  await import('../src/parts/GetOrCreateLanguageService/GetOrCreateLanguageService.ts')

afterEach(resetLanguageServices)

const fixture = () => {
  const config = JSON.stringify({
    compilerOptions: { allowImportingTsExtensions: true, noEmit: true, noLib: true, strict: true, types: [] },
    exclude: ['src/excluded.ts'],
    include: ['src/**/*.ts', 'test/**/*.ts', 'types/**/*.d.ts'],
  })
  const disk = new Map<string, string>([
    ['/workspace/a/tsconfig.json', config],
    ['/workspace/b/tsconfig.json', config],
    ['/workspace/a/src/main.ts', 'export const a: number = 1'],
    ['/workspace/b/src/main.ts', 'export const b: number = 2'],
    ['/workspace/a/test/check.ts', 'export const test: number = 3'],
    ['/workspace/a/types/global.d.ts', 'declare const configured: number'],
    ['/workspace/a/src/excluded.ts', 'export const excluded = 4'],
    ['/workspace/shared.ts', 'export const shared: number = 1'],
  ])
  const fs = createFileSystem((uri) => disk.get(uri))
  const hashes = new Map<string, string>()
  const contentHashes = new Map<string, string>()
  const cache = {
    close() {},
    get: (key: string) => hashes.get(key),
    set: (key: string, text: string) => hashes.set(key, text),
  }
  const client = createCachedClient(
    {
      invokeSync(method, uri) {
        if (method === 'FileCache.getHashes')
          return uri.map((path: string) => {
            const content = disk.get(path)
            if (content === undefined) return null
            if (!contentHashes.has(content))
              contentHashes.set(content, (contentHashes.size + 1).toString(16).padStart(64, '0'))
            return contentHashes.get(content)
          })
        if (method === 'SyncApi.getWorkspaceUri') return 'file:///workspace'
        const path = uri.replace(/^file:\/\//, '').replace(/\/$/, '')
        if (method === 'SyncApi.exists') return disk.has(path) || disk.keys().some((key) => key.startsWith(path + '/'))
        if (method === 'SyncApi.readFileSync') {
          if (!disk.has(path)) throw new Error('missing file')
          return disk.get(path)
        }
        if (method === 'SyncApi.readDirSync') {
          if (disk.has(path)) throw new Error('not a directory')
          return [
            ...new Set(
              disk
                .keys()
                .filter((key) => key.startsWith(path + '/'))
                .map((key) => key.slice(path.length + 1).split('/', 1)[0]),
            ),
          ]
        }
        throw new Error(method)
      },
    },
    fs,
    cache,
    cache,
  )
  LanguageServices.set(1, fs, client, ts)
  const service = async (uri: string) => {
    await Promise.resolve() // real worker requests run in separate turns
    return getOrCreateLanguageService(uri).languageService
  }
  return { disk, fs, service }
}

const a = '/workspace/a/src/main.ts'
const b = '/workspace/b/src/main.ts'

test('independent roots and programs stay isolated while configured tests and declarations remain', async () => {
  const { fs, service } = fixture()
  const first = await service(a)
  fs.writeFile(a, 'export const a: number = 1')
  first.getSemanticDiagnostics(a)
  const second = await service(b)
  fs.writeFile(b, 'export const b: number = 2')
  const before = second.getProgram()
  expect(first.getProgram()?.getRootFileNames()).toEqual([
    a,
    '/workspace/a/test/check.ts',
    '/workspace/a/types/global.d.ts',
  ])
  expect(second.getProgram()?.getRootFileNames()).toEqual([b])
  fs.writeFile(a, 'export const a: number = "bad"')
  expect(first.getSemanticDiagnostics(a).map((item) => item.code)).toContain(2322)
  expect(await service(b)).toBe(second)
  expect(second.getProgram()).toBe(before)
  expect(getProjectCount()).toBe(2)
})

test('new and excluded open documents reuse their config and nested configs take precedence', async () => {
  const { disk, fs, service } = fixture()
  const first = await service(a)
  expect(await service('/workspace/a/src/excluded.ts')).toBe(first)
  const created = '/workspace/a/src/new.ts'
  fs.writeFile(created, 'export const created: number = "bad"')
  expect(await service(created)).toBe(first)
  expect(first.getSemanticDiagnostics(created).map((item) => item.code)).toContain(2322)
  expect(getProjectCount()).toBe(1)
  disk.set(
    '/workspace/a/src/tsconfig.json',
    JSON.stringify({ compilerOptions: { noLib: true, types: [] }, files: ['main.ts'] }),
  )
  expect(await service(a)).not.toBe(first)
})

test('cross-project imports and shared override edits update dependent programs without extra roots', async () => {
  const { disk, fs, service } = fixture()
  disk.set(
    a,
    'import { b } from "../../b/src/main.ts"; import { shared } from "../../shared.ts"; export const value: number = b + shared',
  )
  disk.set(b, 'import { shared } from "../../shared.ts"; export const b: number = shared')
  const first = await service(a)
  const second = await service(b)
  expect(first.getSemanticDiagnostics(a).map((item) => item.code)).toEqual([])
  expect(second.getSemanticDiagnostics(b).map((item) => item.code)).toEqual([])
  const before = second.getProgram()
  fs.writeFile('/workspace/shared.ts', 'export const shared: string = "changed"')
  expect(first.getSemanticDiagnostics(a).map((item) => item.code)).toContain(2322)
  expect(second.getSemanticDiagnostics(b).map((item) => item.code)).toContain(2322)
  expect(second.getProgram()).not.toBe(before)
  expect(first.getProgram()?.getRootFileNames()).not.toContain(b)
  expect(getProjectCount()).toBe(2)
})

test('external dependencies invalidate only consumers and unchanged project identities remain watched', async () => {
  const { disk, service } = fixture()
  disk.set(a, 'import { shared } from "../../shared.ts"; export const value: number = shared')
  const first = await service(a)
  expect(first.getSemanticDiagnostics(a).map((item) => item.code)).toEqual([])
  const second = await service(b)
  const before = second.getProgram()
  disk.set('/workspace/shared.ts', 'export const shared = "changed"')
  const updated = await service(a)
  expect(updated).not.toBe(first)
  expect(updated.getSemanticDiagnostics(a).map((item) => item.code)).toContain(2322)
  expect(await service(b)).toBe(second)
  expect(second.getProgram()).toBe(before)
  disk.set(b, 'export const b: number = "bad"')
  const updatedSecond = await service(b)
  expect(updatedSecond).not.toBe(second)
  expect(updatedSecond.getSemanticDiagnostics(b).map((item) => item.code)).toContain(2322)
})

test('configuration changes retain references, explicit rootDir and user JavaScript settings', async () => {
  const { fs, service } = fixture()
  const first = await service(a)
  fs.writeFile(
    '/workspace/a/tsconfig.json',
    JSON.stringify({
      compilerOptions: { allowJs: false, checkJs: false, noLib: true, rootDir: 'src', types: [] },
      files: ['src/main.ts'],
      references: [{ path: '../b' }],
    }),
  )
  const updated = await service(a)
  expect(updated).not.toBe(first)
  const program = updated.getProgram()!
  expect(program.getCompilerOptions().rootDir).toBe('/workspace/a/src')
  expect(program.getCompilerOptions().allowJs).toBe(false)
  expect(program.getCompilerOptions().checkJs).toBe(false)
  expect(program.getProjectReferences()?.map((reference) => reference.path)).toEqual(['/workspace/b'])
})

test('inferred documents share workspace identity without acquiring configured documents', async () => {
  const { fs, service } = fixture()
  const firstUri = '/workspace/loose/first.ts'
  const secondUri = '/workspace/other/second.ts'
  fs.writeFile(firstUri, 'export const first = 1')
  fs.writeFile(secondUri, 'export const second = 2')
  const first = await service(firstUri)
  expect(await service(secondUri)).toBe(first)
  await service(a)
  expect(first.getProgram()?.getRootFileNames()).toEqual([firstUri, secondUri])
  expect(getProjectCount()).toBe(2)
})

test('a newly created missing import and removal of a saved override refresh only dependent programs', async () => {
  const { disk, fs, service } = fixture()
  disk.set(a, 'import { added } from "./added.ts"; export const value: number = added')
  const first = await service(a)
  expect(first.getSemanticDiagnostics(a).map((item) => item.code)).toContain(2307)
  const second = await service(b)
  const before = second.getProgram()
  const added = '/workspace/a/src/added.ts'
  fs.writeFile(added, 'export const added: number = 1')
  expect(first.getSemanticDiagnostics(a).map((item) => item.code)).toEqual([])
  disk.set(added, 'export const added: number = 1')
  expect(fs.releaseFile?.(added)).toBe(true)
  expect(first.getSemanticDiagnostics(a).map((item) => item.code)).toEqual([])
  expect(second.getProgram()).toBe(before)
})

test('external root creation and deletion reparse only the owning configuration', async () => {
  const { disk, service } = fixture()
  const first = await service(a)
  const second = await service(b)
  const before = second.getProgram()
  const created = '/workspace/a/src/created.ts'
  disk.set(created, 'export const created: number = 1')
  const updated = await service(a)
  expect(updated).not.toBe(first)
  expect(updated.getProgram()?.getRootFileNames()).toContain(created)
  expect(await service(b)).toBe(second)
  expect(second.getProgram()).toBe(before)
  disk.delete(created)
  const afterRemoval = await service(a)
  expect(afterRemoval.getProgram()?.getRootFileNames()).not.toContain(created)
})

test('native and file URI configuration identities reuse one service', async () => {
  const { service } = fixture()
  const first = await service(a)
  expect(await service(`file://${a}`)).toBe(first)
  expect(getProjectCount()).toBe(1)
})

test('extends preserves compiler file matching, declarations and excluded directories', async () => {
  const { disk, service } = fixture()
  disk.set(
    '/workspace/a/base.json',
    JSON.stringify({
      compilerOptions: { allowJs: false, noLib: true, types: [] },
      exclude: ['src/excluded.ts'],
      include: ['src/**/*.ts', 'types/**/*.d.ts'],
    }),
  )
  disk.set('/workspace/a/tsconfig.json', JSON.stringify({ extends: './base.json' }))
  const first = await service(a)
  expect(first.getProgram()?.getRootFileNames()).toEqual([a, '/workspace/a/types/global.d.ts'])
  disk.set(
    '/workspace/a/base.json',
    JSON.stringify({
      compilerOptions: { allowJs: false, noLib: true, types: [] },
      files: ['src/main.ts', 'test/check.ts'],
    }),
  )
  const updated = await service(a)
  expect(updated).not.toBe(first)
  expect(updated.getProgram()?.getRootFileNames()).toEqual([a, '/workspace/a/test/check.ts'])
})

test('referenced composite projects retain declaration output diagnostics', async () => {
  const { disk, service } = fixture()
  disk.set(
    '/workspace/a/tsconfig.json',
    JSON.stringify({
      compilerOptions: { allowImportingTsExtensions: true, noEmit: true, noLib: true, types: [] },
      files: ['src/main.ts'],
      references: [{ path: '../b' }],
    }),
  )
  disk.set(
    '/workspace/b/tsconfig.json',
    JSON.stringify({
      compilerOptions: { composite: true, noLib: true, outDir: 'dist', rootDir: 'src', types: [] },
      files: ['src/main.ts'],
    }),
  )
  disk.set('/workspace/b/dist/main.d.ts', 'export declare const b: string')
  disk.set(a, 'import { b } from "../../b/src/main.ts"; export const value: number = b')
  const first = await service(a)
  expect(first.getSemanticDiagnostics(a).map((item) => item.code)).toContain(2322)
  expect(
    first
      .getProgram()
      ?.getProjectReferences()
      ?.map((reference) => reference.path),
  ).toEqual(['/workspace/b'])
  expect(first.getProgram()?.getRootFileNames()).toEqual([a])
})

test('closing an excluded saved document drops its extra root while configured roots remain', async () => {
  const { disk, fs, service } = fixture()
  const first = await service(a)
  const excluded = '/workspace/a/src/excluded.ts'
  fs.writeFile(excluded, disk.get(excluded)!)
  expect(await service(excluded)).toBe(first)
  expect(first.getProgram()?.getRootFileNames()).toContain(excluded)
  collectIdleProjects([a], 0, 0)
  expect(first.getProgram()?.getRootFileNames()).not.toContain(excluded)
  expect(first.getProgram()?.getRootFileNames()).toContain('/workspace/a/test/check.ts')
})

test('JavaScript outside a JS-disabled config receives an inferred service without changing config semantics', async () => {
  const { fs, service } = fixture()
  const configured = await service(a)
  const js = '/workspace/a/src/loose.js'
  fs.writeFile(js, "let value = ''\nvalue++")
  const inferred = await service(js)
  expect(inferred).not.toBe(configured)
  expect(inferred.getSemanticDiagnostics(js).map((item) => item.code)).toContain(2356)
  expect(configured.getProgram()?.getCompilerOptions().allowJs).toBeUndefined()
  expect(configured.getProgram()?.getRootFileNames()).not.toContain(js)
  expect(await service('/workspace/a/src/other.js')).toBe(inferred)
})

test('a JavaScript-enabled config serves its JavaScript documents in the same service', async () => {
  const { disk, fs, service } = fixture()
  disk.set(
    '/workspace/a/tsconfig.json',
    JSON.stringify({
      compilerOptions: { allowJs: true, checkJs: true, noLib: true, types: [] },
      files: ['src/main.ts'],
    }),
  )
  const configured = await service(a)
  const js = '/workspace/a/src/allowed.js'
  fs.writeFile(js, "let value = ''\nvalue++")
  expect(await service(js)).toBe(configured)
  expect(configured.getSemanticDiagnostics(js).map((item) => item.code)).toContain(2356)
  expect(getProjectCount()).toBe(1)
})
