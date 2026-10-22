import { beforeEach, expect, jest, test } from '@jest/globals'

const getPreference = jest.fn<(key: string) => Promise<unknown>>()
const disposals: { readonly id: string; readonly dispose: ReturnType<typeof jest.fn> }[] = []
const registerCommand = jest.fn((command: { readonly id: string; readonly execute: (...args: any[]) => unknown }) => {
  const dispose = jest.fn()
  disposals.push({ dispose, id: command.id })
  return { dispose }
})
const providerDispose = jest.fn()
const serverDispose = jest.fn()
const registerLanguageServer = jest.fn((_options: unknown) => ({ dispose: serverDispose }))
const registerProviders = jest.fn(() => [{ dispose: providerDispose }])
const activateApi = jest.fn<() => Promise<void>>()

jest.unstable_mockModule('@lvce-editor/api', () => ({
  activate: activateApi,
  getPreference,
  registerCommand,
  registerLanguageServer,
}))
jest.unstable_mockModule('../src/parts/RegisterProviders/RegisterProviders.ts', () => ({ registerProviders }))
jest.unstable_mockModule('../src/parts/Providers/Providers.ts', () => ({ provider: {} }))
jest.unstable_mockModule('../src/parts/DiskWatch/DiskWatch.ts', () => ({ stopAll: jest.fn() }))
jest.unstable_mockModule('../src/parts/Rpc/Rpc.ts', () => ({ invoke: jest.fn() }))
jest.unstable_mockModule('../src/parts/ShowPerformanceTrace/ShowPerformanceTrace.ts', () => ({
  showPerformanceTrace: jest.fn(),
}))

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
  disposals.length = 0
})

test.each([undefined, false, 'true'])('preserves worker providers when useTs7 is %p', async (value) => {
  getPreference.mockResolvedValue(value)
  const { activate } = await import('../src/parts/Activate/Activate.ts')
  await activate()
  await activate()
  expect(registerProviders).toHaveBeenCalledTimes(1)
  expect(registerCommand).toHaveBeenCalledTimes(3)
  expect(serverDispose).toHaveBeenCalledTimes(4)
})

test('native mode disposes worker registrations and retains four native document languages', async () => {
  getPreference.mockResolvedValue(true)
  const { activate } = await import('../src/parts/Activate/Activate.ts')
  await activate()
  await activate()
  expect(getPreference).toHaveBeenCalledWith('typescript.useTs7')
  expect(providerDispose).toHaveBeenCalledTimes(1)
  expect(serverDispose).not.toHaveBeenCalled()
  expect(
    disposals
      .filter((item) => item.id !== 'typescript.awaitActivation')
      .every((item) => item.dispose.mock.calls.length === 1),
  ).toBe(true)
  expect(disposals.find((item) => item.id === 'typescript.awaitActivation')?.dispose).not.toHaveBeenCalled()
  expect(registerLanguageServer).toHaveBeenCalledTimes(4)
  for (const languageId of ['javascript', 'javascriptreact', 'typescript', 'typescriptreact']) {
    expect(registerLanguageServer).toHaveBeenCalledWith({
      argv: ['--lsp', '--stdio'],
      id: `typescript.ts7.${languageId}`,
      languageId,
      uri: 'lvce-language-server:typescript',
    })
  }
})

test('command dispatch exists while backend preference is unresolved', async () => {
  const preference = Promise.withResolvers<unknown>()
  getPreference.mockReturnValue(preference.promise)
  const { activate } = await import('../src/parts/Activate/Activate.ts')
  const activating = activate()
  await Promise.resolve()
  await Promise.resolve()
  try {
    expect(
      registerCommand.mock.calls.some(
        ([command]) => (command as { readonly id: string }).id === 'typescript.showPerformanceTrace',
      ),
    ).toBe(true)
  } finally {
    preference.resolve(false)
    await activating
  }
})

test('readiness waits for backend registration and native startup cannot execute worker commands', async () => {
  const preference = Promise.withResolvers<unknown>()
  getPreference.mockReturnValue(preference.promise)
  const { activate } = await import('../src/parts/Activate/Activate.ts')
  const activating = activate()
  const ready = registerCommand.mock.calls.find(([command]) => command.id === 'typescript.awaitActivation')[0].execute()
  const command = registerCommand.mock.calls.find(([item]) => item.id === 'typescript.getProjectCacheStatistics')[0]
  const commandResult = Promise.allSettled([Promise.resolve(command.execute())])
  expect(providerDispose).not.toHaveBeenCalled()
  preference.resolve(true)
  await activating
  await Promise.resolve(ready)
  await expect(commandResult).resolves.toEqual([
    {
      reason: expect.objectContaining({ message: 'This command requires the TypeScript web-worker backend' }),
      status: 'rejected',
    },
  ])
  expect(registerLanguageServer).toHaveBeenCalledTimes(4)
})

test('worker provider dispatch exists before the API snapshots its RPC command map', async () => {
  getPreference.mockResolvedValue(false)
  activateApi.mockImplementationOnce(async () => {
    expect(registerProviders).toHaveBeenCalledTimes(1)
  })
  const { activate } = await import('../src/parts/Activate/Activate.ts')
  await activate()
  expect(providerDispose).not.toHaveBeenCalled()
})

test('worker providers are registered while the backend preference is unresolved', async () => {
  const preference = Promise.withResolvers<unknown>()
  getPreference.mockReturnValue(preference.promise)
  const { activate } = await import('../src/parts/Activate/Activate.ts')
  const activating = activate()
  await Promise.resolve()
  await Promise.resolve()
  try {
    expect(registerProviders).toHaveBeenCalledTimes(1)
  } finally {
    preference.resolve(false)
    await activating
  }
})
