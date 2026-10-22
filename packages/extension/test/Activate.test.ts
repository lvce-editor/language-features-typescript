import { beforeEach, expect, jest, test } from '@jest/globals'

const getPreference = jest.fn<(key: string) => Promise<unknown>>()
const registerCommand = jest.fn()
const registerLanguageServer = jest.fn()
const registerProviders = jest.fn()
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
})

test.each([undefined, false, 'true'])('preserves worker providers when useTs7 is %p', async (value) => {
  getPreference.mockResolvedValue(value)
  const { activate } = await import('../src/parts/Activate/Activate.ts')
  await activate()
  await activate()
  expect(registerProviders).toHaveBeenCalledTimes(1)
  expect(registerCommand).toHaveBeenCalledTimes(2)
  expect(registerLanguageServer).not.toHaveBeenCalled()
})

test('native mode registers four document languages without starting worker providers or commands', async () => {
  getPreference.mockResolvedValue(true)
  const { activate } = await import('../src/parts/Activate/Activate.ts')
  await activate()
  await activate()
  expect(getPreference).toHaveBeenCalledWith('typescript.useTs7')
  expect(registerProviders).not.toHaveBeenCalled()
  expect(registerCommand).not.toHaveBeenCalled()
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
