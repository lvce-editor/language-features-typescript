import { afterEach, expect, jest, test } from '@jest/globals'
import * as ts from 'typescript'
import { createFileSystem } from '../src/parts/CreateFileSystem/CreateFileSystem.ts'
import * as LanguageServices from '../src/parts/LanguageServices/LanguageServices.ts'
import * as RequestActivity from '../src/parts/RequestActivity/RequestActivity.ts'

jest.unstable_mockModule('../src/parts/ReadLibFile/ReadLibFile.ts', () => ({
  readLibFile: () => undefined,
}))
jest.unstable_mockModule('../src/parts/GetTsconfigPath/GetTsconfigPath.ts', () => ({ getTsConfigPath: () => '' }))
jest.unstable_mockModule('../src/parts/ParseTsconfig/ParseTsconfig.ts', () => ({ parseTsconfig: () => ({}) }))
jest.unstable_mockModule('../src/parts/ResolveTsconfig/ResolveTsconfig.ts', () => ({
  resolveTsconfig: () => ({ errors: [], fileNames: ['/a.ts', '/shared.ts'], options: { noLib: true, types: [] } }),
}))
const { collectIdleProjects, getOrCreateLanguageService, getProjectCount, resetLanguageServices } =
  await import('../src/parts/GetOrCreateLanguageService/GetOrCreateLanguageService.ts')

afterEach(() => resetLanguageServices())

const setup = () => {
  const disk = new Map([
    ['/a.ts', 'export const value: number = 1'],
    ['/shared.ts', 'export const shared = 2'],
  ])
  const fs = createFileSystem((uri) => disk.get(uri))
  const clearReferences = jest.fn()
  const forgetReferences = jest.fn()
  LanguageServices.set(1, fs, { clearReferences, forgetReferences, invokeSync: (_method, uri) => disk.get(uri) }, ts)
  return { clearReferences, disk, forgetReferences, fs }
}

test('recreates retired projects with current saved disk content and preserves dirty edits', () => {
  const { clearReferences, disk, fs } = setup()
  const first = getOrCreateLanguageService('/a.ts').languageService
  fs.writeFile('/a.ts', disk.get('/a.ts')!)
  expect(first.getSemanticDiagnostics('/a.ts')).toHaveLength(0)
  disk.set('/a.ts', 'export const value: number = "now invalid"')
  collectIdleProjects([], 0, 0, Number.MAX_SAFE_INTEGER)
  expect(fs.readFile('/a.ts')).toBeUndefined()
  expect(getProjectCount()).toBe(0)
  expect(clearReferences).toHaveBeenCalledTimes(1)
  const next = getOrCreateLanguageService('/a.ts').languageService
  expect(next).not.toBe(first)
  expect(next.getSemanticDiagnostics('/a.ts').map((item) => item.code)).toContain(2322)
  fs.writeFile('/a.ts', 'export const value: number = 42')
  collectIdleProjects([], 0, 0, Number.MAX_SAFE_INTEGER)
  expect(fs.readFile('/a.ts')).toBe('export const value: number = 42')
  expect(getOrCreateLanguageService('/a.ts').languageService.getSemanticDiagnostics('/a.ts')).toHaveLength(0)
})

test('keeps projects with open shared documents and respects idle age and bounded warm cache', () => {
  setup()
  const first = getOrCreateLanguageService('/a.ts').languageService
  // Force another project with overlapping membership.
  getOrCreateLanguageService('/other/outside.ts')
  expect(getProjectCount()).toBe(2)
  collectIdleProjects(['file:///shared.ts', 'file:///shared.ts'], 0, 0, Number.MAX_SAFE_INTEGER)
  expect(getProjectCount()).toBe(2)
  collectIdleProjects([], Number.MAX_SAFE_INTEGER, 0, 0)
  expect(getProjectCount()).toBe(2)
  collectIdleProjects([], 0, 1, Number.MAX_SAFE_INTEGER)
  expect(getProjectCount()).toBe(1)
  collectIdleProjects([], 0, 0, Number.MAX_SAFE_INTEGER)
  expect(getProjectCount()).toBe(0)
  expect(getOrCreateLanguageService('/a.ts').languageService).not.toBe(first)
})

test('does not dispose or release buffers while asynchronous requests use a service', async () => {
  const { disk, fs } = setup()
  const service = getOrCreateLanguageService('/a.ts').languageService
  const dispose = jest.spyOn(service, 'dispose')
  fs.writeFile('/a.ts', disk.get('/a.ts')!)
  const pending = Promise.withResolvers<void>()
  const request = RequestActivity.wrapRequest(async () => {
    await pending.promise
    expect(service.getSemanticDiagnostics('/a.ts')).toHaveLength(0)
  })()
  collectIdleProjects([], 0, 0, Number.MAX_SAFE_INTEGER)
  expect(dispose).not.toHaveBeenCalled()
  expect(fs.readFile('/a.ts')).toBeDefined()
  resetLanguageServices()
  expect(dispose).not.toHaveBeenCalled()
  pending.resolve()
  await request
  expect(dispose).toHaveBeenCalledTimes(1)
})
