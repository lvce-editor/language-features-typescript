import { afterEach, expect, jest, test } from '@jest/globals'
import { provideDefinition } from '../src/parts/ExtensionHost/ExtensionHostDefinitionProviderTypeScript.ts'
import { provideHover } from '../src/parts/ExtensionHost/ExtensionHostHoverProviderTypeScript.ts'
import * as TypeScriptWorker from '../src/parts/TypeScriptWorker/TypeScriptWorker.ts'

afterEach(() => {
  TypeScriptWorker.state.rpcPromise = undefined
})

const document = { text: 'const first = 1; const last = first;', uri: 'file:///project/main.ts' }

test.each([provideDefinition, provideHover])(
  'a burst only executes the newest pending request: %p',
  async (provide) => {
    const invoke = jest.fn(async (_method: string, _document: any, offset: number) => ({ offset }))
    TypeScriptWorker.state.rpcPromise = Promise.resolve({ invoke }) as any

    const results = await Promise.all(Array.from({ length: 10 }, (_, offset) => provide(document, offset)))

    expect(invoke).toHaveBeenCalledTimes(1)
    expect(invoke).toHaveBeenLastCalledWith(expect.any(String), document, 9)
    expect(results).toEqual([...Array(9).fill(null), { offset: 9 }])
  },
)

test.each([provideDefinition, provideHover])('replaces pending work while a request is active: %p', async (provide) => {
  const active = Promise.withResolvers<any>()
  const started = Promise.withResolvers<void>()
  const invoke = jest.fn(async (_method: string, _document: any, offset: number) => {
    if (offset === 0) {
      started.resolve()
      return active.promise
    }
    return { offset }
  })
  TypeScriptWorker.state.rpcPromise = Promise.resolve({ invoke }) as any
  const first = provide(document, 0)
  await started.promise
  const rest = Array.from({ length: 9 }, (_, index) => provide(document, index + 1))
  active.resolve({ offset: 0 })

  expect(await Promise.all([first, ...rest])).toEqual([...Array(9).fill(null), { offset: 9 }])
  expect(invoke.mock.calls.map((call) => call[2])).toEqual([0, 9])
})

test('documents, tabs, and providers do not supersede each other', async () => {
  const invoke = jest.fn(async (method: string, doc: any, offset: number) => ({ method, offset, uri: doc.uri }))
  TypeScriptWorker.state.rpcPromise = Promise.resolve({ invoke }) as any
  const results = await Promise.all([
    provideDefinition(document, 1),
    provideHover(document, 2),
    provideDefinition({ ...document, uri: 'file:///other.ts' }, 3),
    provideDefinition({ ...document, documentId: 2 }, 4),
  ])
  expect(results.every(Boolean)).toBe(true)
  expect(invoke).toHaveBeenCalledTimes(4)
})

test('a superseded failure is consumed and the latest failure rejects without poisoning later requests', async () => {
  const active = Promise.withResolvers<any>()
  const started = Promise.withResolvers<void>()
  const invoke = jest.fn(async (_method: string, _doc: any, offset: number) => {
    if (offset === 0) {
      started.resolve()
      return active.promise
    }
    if (offset === 1) throw new Error('latest failed')
    return { offset }
  })
  TypeScriptWorker.state.rpcPromise = Promise.resolve({ invoke }) as any
  const first = provideDefinition(document, 0)
  await started.promise
  const latest = provideDefinition(document, 1)
  const failure = (async () => {
    try {
      await latest
    } catch (error) {
      return error
    }
    return undefined
  })()
  active.reject(new Error('obsolete failed'))
  await expect(first).resolves.toBeNull()
  expect(await failure).toEqual(new Error('latest failed'))
  await expect(provideDefinition(document, 2)).resolves.toEqual({ offset: 2 })
})
