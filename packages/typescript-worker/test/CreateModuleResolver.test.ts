import { test, expect, jest } from '@jest/globals'
import * as TypeScript from 'typescript'
import { createModuleResolver } from '../src/parts/CreateModuleResolver/CreateModuleResolver.ts'

test('createModuleResolver should return a module resolver function', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockSyncRpc = {
    invokeSync: (method: string, ...params: any[]) => {
      if (method === 'SyncApi.readFileSync') {
        return JSON.stringify({ main: 'index.js', types: 'index.d.ts' })
      }
      throw new Error(`unexpected method ${method}`)
    },
  }

  const resolver = createModuleResolver(mockSyncRpc)

  expect(typeof resolver).toBe('function')
})

test('createModuleResolver should return undefined for non-fully specified modules', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockSyncRpc = {
    invokeSync: () => '',
  }

  const resolver = createModuleResolver(mockSyncRpc)

  // Test empty string
  const result1 = resolver('', '/path/to/file.ts', {
    target: TypeScript.ScriptTarget.ES2020,
  })
  expect(result1.resolvedModule).toBeUndefined()

  // Test single dot
  const result2 = resolver('.', '/path/to/file.ts', {
    target: TypeScript.ScriptTarget.ES2020,
  })
  expect(result2.resolvedModule).toBeUndefined()

  // Test ./ only
  const result3 = resolver('./', '/path/to/file.ts', {
    target: TypeScript.ScriptTarget.ES2020,
  })
  expect(result3.resolvedModule).toBeUndefined()
})

test('createModuleResolver should handle relative imports starting with ./', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockSyncRpc = {
    invokeSync: () => '',
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver('./relative-module', '/path/to/file.ts', {
    target: TypeScript.ScriptTarget.ES2020,
  })

  expect(result.resolvedModule).toBeDefined()
  expect(result.resolvedModule?.extension).toBe('')
  expect(result.resolvedModule?.resolvedFileName).toBe('')
})

test('createModuleResolver should handle relative imports starting with ../', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockSyncRpc = {
    invokeSync: () => '',
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver('../parent-module', '/path/to/file.ts', {
    target: TypeScript.ScriptTarget.ES2020,
  })

  expect(result.resolvedModule).toBeDefined()
  expect(result.resolvedModule?.extension).toBe('')
  expect(result.resolvedModule?.resolvedFileName).toBe('')
})

test('createModuleResolver should resolve node modules with package.json', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockSyncRpc = {
    invokeSync: (method: string, ...params: any[]) => {
      if (method === 'SyncApi.readFileSync') {
        return JSON.stringify({ main: 'index.js', types: 'index.d.ts' })
      }
      throw new Error(`unexpected method ${method}`)
    },
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver('lodash', '/project/src/file.ts', {
    target: TypeScript.ScriptTarget.ES2020,
    rootDir: '/project',
  })

  expect(result.resolvedModule).toBeDefined()
  expect(result.resolvedModule?.extension).toBe('.d.ts')
  expect(result.resolvedModule?.resolvedFileName).toBe('/project/node_modules/lodash/index.d.ts')
  expect(result.resolvedModule?.isExternalLibraryImport).toBe(true)
})

test('createModuleResolver should prefer types over main in package.json', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockSyncRpc = {
    invokeSync: (method: string, ...params: any[]) => {
      if (method === 'SyncApi.readFileSync') {
        return JSON.stringify({ main: 'index.js', types: 'types/index.d.ts' })
      }
      throw new Error(`unexpected method ${method}`)
    },
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver('some-package', '/project/src/file.ts', {
    target: TypeScript.ScriptTarget.ES2020,
    rootDir: '/project',
  })

  expect(result.resolvedModule).toBeDefined()
  expect(result.resolvedModule?.resolvedFileName).toBe('/project/node_modules/some-package/types/index.d.ts')
})

test('createModuleResolver should fallback to main when types is not available', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockSyncRpc = {
    invokeSync: (method: string, ...params: any[]) => {
      if (method === 'SyncApi.readFileSync') {
        return JSON.stringify({ main: 'lib/index.js' })
      }
      throw new Error(`unexpected method ${method}`)
    },
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver('some-package', '/project/src/file.ts', {
    target: TypeScript.ScriptTarget.ES2020,
    rootDir: '/project',
  })

  expect(result.resolvedModule).toBeDefined()
  expect(result.resolvedModule?.resolvedFileName).toBe('/project/node_modules/some-package/lib/index.js')
})

test('createModuleResolver should handle missing rootDir', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockSyncRpc = {
    invokeSync: (method: string, ...params: any[]) => {
      if (method === 'SyncApi.readFileSync') {
        return JSON.stringify({ main: 'index.js' })
      }
      throw new Error(`unexpected method ${method}`)
    },
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver('some-package', '/project/src/file.ts', {
    target: TypeScript.ScriptTarget.ES2020,
  })

  expect(result.resolvedModule).toBeDefined()
  expect(result.resolvedModule?.resolvedFileName).toBe('/node_modules/some-package/index.js')
})

test('createModuleResolver should handle JSON parse errors', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockSyncRpc = {
    invokeSync: (method: string, ...params: any[]) => {
      if (method === 'SyncApi.readFileSync') {
        return 'invalid json'
      }
      throw new Error(`unexpected method ${method}`)
    },
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver('some-package', '/project/src/file.ts', {
    target: TypeScript.ScriptTarget.ES2020,
    rootDir: '/project',
  })

  expect(result.resolvedModule).toBeDefined()
  expect(result.resolvedModule?.extension).toBe('')
  expect(result.resolvedModule?.resolvedFileName).toBe('')
})

test('createModuleResolver should handle file read errors', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockSyncRpc = {
    invokeSync: (method: string, ...params: any[]) => {
      if (method === 'SyncApi.readFileSync') {
        throw new Error('File not found')
      }
      throw new Error(`unexpected method ${method}`)
    },
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver('some-package', '/project/src/file.ts', {
    target: TypeScript.ScriptTarget.ES2020,
    rootDir: '/project',
  })

  expect(result.resolvedModule).toBeDefined()
  expect(result.resolvedModule?.extension).toBe('')
  expect(result.resolvedModule?.resolvedFileName).toBe('')
})

test('createModuleResolver should handle empty package.json', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockSyncRpc = {
    invokeSync: (method: string, ...params: any[]) => {
      if (method === 'SyncApi.readFileSync') {
        return JSON.stringify({})
      }
      throw new Error(`unexpected method ${method}`)
    },
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver('some-package', '/project/src/file.ts', {
    target: TypeScript.ScriptTarget.ES2020,
    rootDir: '/project',
  })

  expect(result.resolvedModule).toBeDefined()
  expect(result.resolvedModule?.extension).toBe('')
  expect(result.resolvedModule?.resolvedFileName).toBe('')
})

test('createModuleResolver should handle null package.json', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockSyncRpc = {
    invokeSync: (method: string, ...params: any[]) => {
      if (method === 'SyncApi.readFileSync') {
        return JSON.stringify({ main: null, types: null })
      }
      throw new Error(`unexpected method ${method}`)
    },
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver('some-package', '/project/src/file.ts', {
    target: TypeScript.ScriptTarget.ES2020,
    rootDir: '/project',
  })

  expect(result.resolvedModule).toBeDefined()
  expect(result.resolvedModule?.extension).toBe('')
  expect(result.resolvedModule?.resolvedFileName).toBe('')
})
