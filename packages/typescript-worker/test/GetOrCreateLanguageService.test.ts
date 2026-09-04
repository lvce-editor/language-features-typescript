import { expect, jest, test } from '@jest/globals'

const createTypeScriptLanguageService = jest.fn(() => ({
  getProgram: jest.fn(),
}))

jest.unstable_mockModule('../src/parts/CreateTypeScriptLanguageService/CreateTypeScriptLanguageService.ts', () => ({
  createTypeScriptLanguageService,
}))

jest.unstable_mockModule('../src/parts/GetTsconfigPath/GetTsconfigPath.ts', () => ({
  getTsConfigPath: jest.fn(() => '/workspace/tsconfig.json'),
}))

jest.unstable_mockModule('../src/parts/LanguageServices/LanguageServices.ts', () => ({
  get: jest.fn(() => ({
    client: {
      invokeSync: jest.fn(),
    },
    fs: {},
    ts: {},
  })),
}))

jest.unstable_mockModule('../src/parts/ParseTsconfig/ParseTsconfig.ts', () => ({
  parseTsconfig: jest.fn(() => ({})),
}))

jest.unstable_mockModule('../src/parts/ResolveTsconfig/ResolveTsconfig.ts', () => ({
  resolveTsconfig: jest.fn(() => ({
    errors: [],
    fileNames: ['/workspace/src/main.tsx', '/workspace/src/App.tsx'],
    options: {},
  })),
}))

const { getOrCreateLanguageService } =
  await import('../src/parts/GetOrCreateLanguageService/GetOrCreateLanguageService.ts')

test('reuses a language service for files in the same configured project', () => {
  const first = getOrCreateLanguageService('/workspace/src/main.tsx')
  const second = getOrCreateLanguageService('/workspace/src/App.tsx')

  expect(second.languageService).toBe(first.languageService)
  expect(createTypeScriptLanguageService).toHaveBeenCalledTimes(1)
})
