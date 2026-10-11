import { afterEach, beforeEach, expect, jest, test } from '@jest/globals'
import { provideCompletions } from '../src/parts/ExtensionHost/ExtensionHostCompletionProviderTypeScript.ts'
import { provideDiagnostics } from '../src/parts/ExtensionHost/ExtensionHostDiagnosticProviderTypeScript.ts'
import * as IgnoreDiagnostics from '../src/parts/IgnoreDiagnostics/IgnoreDiagnostics.ts'
import * as TypeScriptWorker from '../src/parts/TypeScriptWorker/TypeScriptWorker.ts'

const uri = 'memfs:///demo/src/main.ts'
const text = 'export const value = 1'
const config = '{"compilerOptions":{"strict":true}}'
const hash = async (text: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}
const textHash = await hash(text)
const configHash = await hash(config)
const original = { ...IgnoreDiagnostics.state, launch: TypeScriptWorker.state.launchTypeScriptWorker }
const invoke = jest.fn<(...args: unknown[]) => Promise<string[]>>(async () => ['result'])
const launch = jest.fn(async () => ({ invoke }))

beforeEach(() => {
  IgnoreDiagnostics.state.getPreference = async () => [
    { configHash, configUri: 'memfs:///demo/tsconfig.json', hash: textHash, uri },
  ]
  IgnoreDiagnostics.state.readFile = async () => config
  TypeScriptWorker.state.rpcPromise = undefined
  TypeScriptWorker.state.launchTypeScriptWorker = launch
  launch.mockClear()
  invoke.mockClear()
})
afterEach(() => {
  IgnoreDiagnostics.state.getPreference = original.getPreference
  IgnoreDiagnostics.state.readFile = original.readFile
  TypeScriptWorker.state.launchTypeScriptWorker = original.launch
  TypeScriptWorker.state.rpcPromise = undefined
})

test('unchanged verified document skips diagnostics before launching TypeScript', async () => {
  expect(await provideDiagnostics({ text, uri })).toEqual([])
  expect(launch).not.toHaveBeenCalled()
})

test.each([
  { text: `${text}\nconst value: number = "invalid"`, uri },
  { text, uri: 'memfs:///other/src/main.ts' },
])('changed text or URI receives diagnostics', async (document) => {
  expect(await provideDiagnostics(document)).toEqual(['result'])
  expect(launch).toHaveBeenCalledTimes(1)
  expect(invoke).toHaveBeenCalledWith('Diagnostic.getDiagnostics', document)
})

test('changed compiler configuration resumes checking', async () => {
  IgnoreDiagnostics.state.readFile = async () => '{}'
  expect(await provideDiagnostics({ text, uri })).toEqual(['result'])
  expect(launch).toHaveBeenCalledTimes(1)
})

test('unavailable configuration evidence resumes checking', async () => {
  IgnoreDiagnostics.state.readFile = async () => {
    throw new Error('missing')
  }
  expect(await provideDiagnostics({ text, uri })).toEqual(['result'])
})

test.each([undefined, [], {}, [{ hash: textHash, uri }]])(
  'missing or invalid preferences resume checking',
  async (preference) => {
    IgnoreDiagnostics.state.getPreference = async () => preference
    expect(await provideDiagnostics({ text, uri })).toEqual(['result'])
  },
)

test('completion for verified content still starts the worker', async () => {
  const document = { languageId: 'typescript', text, uri, version: 1 }
  expect(await provideCompletions(document, 10)).toEqual(['result'])
  expect(launch).toHaveBeenCalledTimes(1)
  expect(invoke).toHaveBeenCalledWith('Completion.getCompletions', document, 10)
})
