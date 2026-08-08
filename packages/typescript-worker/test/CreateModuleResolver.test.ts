// cspell:ignore extensionless
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
    invokeSync: () => true,
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
    invokeSync: () => true,
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver('./relative-module', '/path/to/file.ts', {
    target: TypeScript.ScriptTarget.ES2020,
  })

  expect(result.resolvedModule).toBeDefined()
  expect(result.resolvedModule?.extension).toBe('')
  expect(result.resolvedModule?.resolvedFileName).toBe('/path/to/relative-module')
})

test('createModuleResolver should handle relative imports starting with ../', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver('../parent-module', '/path/to/file.ts', {
    target: TypeScript.ScriptTarget.ES2020,
  })

  expect(result.resolvedModule).toBeDefined()
  expect(result.resolvedModule?.extension).toBe('')
  expect(result.resolvedModule?.resolvedFileName).toBe('/path/parent-module')
})

test('createModuleResolver should normalize relative imports from file uris', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver(
    '../src/parts/DomEventListenerFunctions/DomEventListenerFunctions.ts',
    'file:///workspace/editor-worker/packages/editor-worker/test/DomEventListenerFunctions.test.ts',
    {
      target: TypeScript.ScriptTarget.ES2020,
    },
  )

  expect(result.resolvedModule).toBeDefined()
  expect(result.resolvedModule?.extension).toBe('.ts')
  expect(result.resolvedModule?.resolvedFileName).toBe(
    'file:///workspace/editor-worker/packages/editor-worker/src/parts/DomEventListenerFunctions/DomEventListenerFunctions.ts',
  )
})

test('createModuleResolver should preserve absolute file paths for relative imports', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver(
    '../src/parts/DomEventListenerFunctions/DomEventListenerFunctions.ts',
    '/workspace/editor-worker/packages/editor-worker/test/DomEventListenerFunctions.test.ts',
    {
      target: TypeScript.ScriptTarget.ES2020,
    },
  )

  expect(result.resolvedModule).toBeDefined()
  expect(result.resolvedModule?.extension).toBe('.ts')
  expect(result.resolvedModule?.resolvedFileName).toBe(
    '/workspace/editor-worker/packages/editor-worker/src/parts/DomEventListenerFunctions/DomEventListenerFunctions.ts',
  )
})

test('createModuleResolver should resolve .ts imports from declaration files in node_modules as .d.ts files', () => {
  const resolver = createModuleResolver({
    invokeSync: () => true,
  })

  const result = resolver('./parts/Activation/Activation.ts', '/project/node_modules/abc/index.d.ts', {
    target: TypeScript.ScriptTarget.ES2020,
  })

  expect(result.resolvedModule).toBeDefined()
  expect(result.resolvedModule?.extension).toBe('.d.ts')
  expect(result.resolvedModule?.resolvedFileName).toBe('/project/node_modules/abc/parts/Activation/Activation.d.ts')
})

test('createModuleResolver should resolve extensionless imports from declaration files in node_modules as .d.ts files', () => {
  const resolver = createModuleResolver({
    invokeSync: () => true,
  })

  const result = resolver('./dispatcher', '/project/node_modules/undici-types/index.d.ts', {
    target: TypeScript.ScriptTarget.ES2020,
  })

  expect(result.resolvedModule).toBeDefined()
  expect(result.resolvedModule?.extension).toBe('.d.ts')
  expect(result.resolvedModule?.resolvedFileName).toBe('/project/node_modules/undici-types/dispatcher.d.ts')
})

test('createModuleResolver should fall back to a TypeScript source when a declaration import has no declaration file', () => {
  const invokeSync = jest.fn((method: string, uri: string) => {
    if (method === 'SyncApi.exists') {
      return uri === '/project/node_modules/picocolors/types.ts'
    }
    throw new Error(`unexpected method ${method}`)
  })
  const resolver = createModuleResolver({ invokeSync })

  const result = resolver('./types', '/project/node_modules/picocolors/picocolors.d.ts', {
    target: TypeScript.ScriptTarget.ES2020,
  })

  expect(result.resolvedModule?.extension).toBe('.ts')
  expect(result.resolvedModule?.resolvedFileName).toBe('/project/node_modules/picocolors/types.ts')
  expect(result.resolvedModule?.resolvedUsingTsExtension).toBe(false)
  expect(invokeSync).toHaveBeenNthCalledWith(1, 'SyncApi.exists', '/project/node_modules/picocolors/types.d.ts')
  expect(invokeSync).toHaveBeenNthCalledWith(2, 'SyncApi.exists', '/project/node_modules/picocolors/types.ts')
})

test('createModuleResolver should resolve declaration imports ending in .d', () => {
  const invokeSync = jest.fn((method: string, uri: string) => {
    if (method === 'SyncApi.exists') {
      return uri === '/project/node_modules/tailwindcss/types/config.d.ts'
    }
    throw new Error(`unexpected method ${method}`)
  })
  const resolver = createModuleResolver({ invokeSync })

  const result = resolver('./config.d', '/project/node_modules/tailwindcss/types/index.d.ts', {
    target: TypeScript.ScriptTarget.ES2020,
  })

  expect(result.resolvedModule?.extension).toBe('.d.ts')
  expect(result.resolvedModule?.resolvedFileName).toBe('/project/node_modules/tailwindcss/types/config.d.ts')
  expect(result.resolvedModule?.resolvedUsingTsExtension).toBe(false)
})

test('createModuleResolver should preserve .d.ts imports from declaration files in node_modules', () => {
  const resolver = createModuleResolver({
    invokeSync: () => true,
  })

  const result = resolver('./parts/Activation/Activation.d.ts', '/project/node_modules/abc/index.d.ts', {
    target: TypeScript.ScriptTarget.ES2020,
  })

  expect(result.resolvedModule?.resolvedFileName).toBe('/project/node_modules/abc/parts/Activation/Activation.d.ts')
})

test('createModuleResolver should preserve .ts imports outside node_modules', () => {
  const resolver = createModuleResolver({
    invokeSync: () => true,
  })

  const result = resolver('./parts/Activation/Activation.ts', '/project/src/index.d.ts', {
    target: TypeScript.ScriptTarget.ES2020,
  })

  expect(result.resolvedModule?.resolvedFileName).toBe('/project/src/parts/Activation/Activation.ts')
})

test('createModuleResolver should resolve node modules with package.json', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockSyncRpc = {
    invokeSync: (method: string, ...params: any[]) => {
      if (method === 'SyncApi.exists') {
        return params[0] === '/project/node_modules/lodash/package.json'
      }
      if (method === 'SyncApi.readFileSync' && params[0] === '/project/node_modules/lodash/package.json') {
        return JSON.stringify({ main: 'index.js', types: 'index.d.ts' })
      }
      throw new Error('File not found')
    },
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver('lodash', '/project/src/file.ts', {
    rootDir: '/project',
    target: TypeScript.ScriptTarget.ES2020,
  })

  expect(result.resolvedModule).toBeDefined()
  expect(result.resolvedModule?.extension).toBe('.d.ts')
  expect(result.resolvedModule?.resolvedFileName).toBe('/project/node_modules/lodash/index.d.ts')
  expect(result.resolvedModule?.isExternalLibraryImport).toBe(true)
})

test('createModuleResolver should resolve node modules relative to a file in a monorepo package', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const invokeSync = jest.fn((method: string, packageJsonPath: string) => {
    if (method === 'SyncApi.exists') {
      return packageJsonPath === '/project/packages/build/node_modules/some-package/package.json'
    }
    if (method === 'SyncApi.readFileSync') {
      return JSON.stringify({ types: 'index.d.ts' })
    }
    throw new Error(`unexpected method ${method}`)
  })
  const resolver = createModuleResolver({ invokeSync })

  const result = resolver('some-package', '/project/packages/build/src/build.ts', {
    rootDir: '/project',
    target: TypeScript.ScriptTarget.ES2020,
  })

  expect(result.resolvedModule?.resolvedFileName).toBe('/project/packages/build/node_modules/some-package/index.d.ts')
  expect(invokeSync).toHaveBeenNthCalledWith(
    1,
    'SyncApi.exists',
    '/project/packages/build/src/node_modules/some-package/package.json',
  )
  expect(invokeSync).toHaveBeenNthCalledWith(
    2,
    'SyncApi.exists',
    '/project/packages/build/node_modules/some-package/package.json',
  )
  expect(invokeSync).toHaveBeenNthCalledWith(
    3,
    'SyncApi.readFileSync',
    '/project/packages/build/node_modules/some-package/package.json',
  )
})

test('createModuleResolver should resolve hoisted node modules above the configured root directory', () => {
  const invokeSync = jest.fn((method: string, packageJsonPath: string) => {
    if (method === 'SyncApi.exists') {
      return packageJsonPath === '/project/node_modules/some-package/package.json'
    }
    if (method === 'SyncApi.readFileSync') {
      return JSON.stringify({ types: 'index.d.ts' })
    }
    throw new Error(`unexpected method ${method}`)
  })
  const resolver = createModuleResolver({ invokeSync })

  const result = resolver('some-package', '/project/packages/build/src/build.ts', {
    rootDir: '/project/packages/build',
    target: TypeScript.ScriptTarget.ES2020,
  })

  expect(result.resolvedModule?.resolvedFileName).toBe('/project/node_modules/some-package/index.d.ts')
  expect(invokeSync).toHaveBeenCalledWith('SyncApi.readFileSync', '/project/node_modules/some-package/package.json')
})

test('createModuleResolver should prefer types over main in package.json', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockSyncRpc = {
    invokeSync: (method: string, ...params: any[]) => {
      if (method === 'SyncApi.exists') {
        return params[0] === '/project/node_modules/some-package/package.json'
      }
      if (method === 'SyncApi.readFileSync' && params[0] === '/project/node_modules/some-package/package.json') {
        return JSON.stringify({ main: 'index.js', types: 'types/index.d.ts' })
      }
      throw new Error('File not found')
    },
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver('some-package', '/project/src/file.ts', {
    rootDir: '/project',
    target: TypeScript.ScriptTarget.ES2020,
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
      if (method === 'SyncApi.exists') {
        return params[0] === '/project/node_modules/some-package/package.json'
      }
      if (method === 'SyncApi.readFileSync' && params[0] === '/project/node_modules/some-package/package.json') {
        return JSON.stringify({ main: 'lib/index.js' })
      }
      throw new Error('File not found')
    },
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver('some-package', '/project/src/file.ts', {
    rootDir: '/project',
    target: TypeScript.ScriptTarget.ES2020,
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
      if (method === 'SyncApi.exists') {
        return params[0] === '/node_modules/some-package/package.json'
      }
      if (method === 'SyncApi.readFileSync' && params[0] === '/node_modules/some-package/package.json') {
        return JSON.stringify({ main: 'index.js' })
      }
      throw new Error('File not found')
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
      if (method === 'SyncApi.exists') {
        return true
      }
      if (method === 'SyncApi.readFileSync') {
        return 'invalid json'
      }
      throw new Error(`unexpected method ${method}`)
    },
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver('some-package', '/project/src/file.ts', {
    rootDir: '/project',
    target: TypeScript.ScriptTarget.ES2020,
  })

  expect(result.resolvedModule).toBeUndefined()
})

test('createModuleResolver should handle file read errors', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockSyncRpc = {
    invokeSync: (method: string, ...params: any[]) => {
      if (method === 'SyncApi.exists') {
        return true
      }
      if (method === 'SyncApi.readFileSync') {
        throw new Error('File not found')
      }
      throw new Error(`unexpected method ${method}`)
    },
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver('some-package', '/project/src/file.ts', {
    rootDir: '/project',
    target: TypeScript.ScriptTarget.ES2020,
  })

  expect(result.resolvedModule).toBeUndefined()
})

test('createModuleResolver should handle empty package.json', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockSyncRpc = {
    invokeSync: (method: string, ...params: any[]) => {
      if (method === 'SyncApi.exists') {
        return true
      }
      if (method === 'SyncApi.readFileSync') {
        return JSON.stringify({})
      }
      throw new Error(`unexpected method ${method}`)
    },
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver('some-package', '/project/src/file.ts', {
    rootDir: '/project',
    target: TypeScript.ScriptTarget.ES2020,
  })

  expect(result.resolvedModule).toBeUndefined()
})

test('createModuleResolver should handle null package.json', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockSyncRpc = {
    invokeSync: (method: string, ...params: any[]) => {
      if (method === 'SyncApi.exists') {
        return true
      }
      if (method === 'SyncApi.readFileSync') {
        return JSON.stringify({ main: null, types: null })
      }
      throw new Error(`unexpected method ${method}`)
    },
  }

  const resolver = createModuleResolver(mockSyncRpc)

  const result = resolver('some-package', '/project/src/file.ts', {
    rootDir: '/project',
    target: TypeScript.ScriptTarget.ES2020,
  })

  expect(result.resolvedModule).toBeUndefined()
})

const createWorkspaceSyncRpc = (files: Readonly<Record<string, string>>) => {
  const existingPaths = new Set(Object.keys(files))
  for (const fileName of Object.keys(files)) {
    let path = fileName
    while (path.includes('/')) {
      path = path.slice(0, path.lastIndexOf('/'))
      existingPaths.add(path)
    }
  }
  return {
    invokeSync(method: string, path: string) {
      if (method === 'SyncApi.exists') {
        return existingPaths.has(path)
      }
      if (method === 'SyncApi.readFileSync') {
        if (Object.hasOwn(files, path)) {
          return files[path]
        }
        throw new Error('File not found')
      }
      throw new Error(`unexpected method ${method}`)
    },
  }
}

const bundlerOptions = {
  jsx: TypeScript.JsxEmit.ReactJSX,
  module: TypeScript.ModuleKind.ESNext,
  moduleResolution: TypeScript.ModuleResolutionKind.Bundler,
}

test('createModuleResolver should prefer installed React declarations over the runtime JavaScript entrypoint', () => {
  const syncRpc = createWorkspaceSyncRpc({
    '/project/node_modules/@types/react/index.d.ts': 'export = React',
    '/project/node_modules/@types/react/package.json': JSON.stringify({ types: 'index.d.ts' }),
    '/project/node_modules/react/index.js': 'module.exports = {}',
    '/project/node_modules/react/package.json': JSON.stringify({ main: 'index.js' }),
    '/project/src/main.tsx': "import React from 'react'",
  })
  const resolver = createModuleResolver(syncRpc, TypeScript)

  const result = resolver('react', '/project/src/main.tsx', bundlerOptions)

  expect(result.resolvedModule?.extension).toBe('.d.ts')
  expect(result.resolvedModule?.resolvedFileName).toBe('/project/node_modules/@types/react/index.d.ts')
})

test('createModuleResolver should resolve React declaration subpaths', () => {
  const syncRpc = createWorkspaceSyncRpc({
    '/project/node_modules/@types/react-dom/client.d.ts': "import React = require('react')",
    '/project/node_modules/@types/react-dom/index.d.ts': 'export as namespace ReactDOM',
    '/project/node_modules/@types/react-dom/package.json': JSON.stringify({ types: 'index.d.ts' }),
    '/project/node_modules/react-dom/client.js': 'module.exports = {}',
    '/project/node_modules/react-dom/package.json': JSON.stringify({
      exports: {
        './client': './client.js',
      },
      main: 'index.js',
    }),
    '/project/src/main.tsx': "import ReactDOM from 'react-dom/client'",
  })
  const resolver = createModuleResolver(syncRpc, TypeScript)

  const result = resolver('react-dom/client', '/project/src/main.tsx', bundlerOptions)

  expect(result.resolvedModule?.extension).toBe('.d.ts')
  expect(result.resolvedModule?.resolvedFileName).toBe('/project/node_modules/@types/react-dom/client.d.ts')
})

test('createModuleResolver should resolve the automatic React JSX runtime declarations', () => {
  const syncRpc = createWorkspaceSyncRpc({
    '/project/node_modules/@types/react/index.d.ts': 'export = React',
    '/project/node_modules/@types/react/jsx-runtime.d.ts': "import './'",
    '/project/node_modules/@types/react/package.json': JSON.stringify({ types: 'index.d.ts' }),
    '/project/node_modules/react/jsx-runtime.js': 'module.exports = {}',
    '/project/node_modules/react/package.json': JSON.stringify({
      exports: {
        './jsx-runtime': './jsx-runtime.js',
      },
      main: 'index.js',
    }),
    '/project/src/App.tsx': 'export const App = () => <main />',
  })
  const resolver = createModuleResolver(syncRpc, TypeScript)

  const result = resolver('react/jsx-runtime', '/project/src/App.tsx', bundlerOptions)

  expect(result.resolvedModule?.extension).toBe('.d.ts')
  expect(result.resolvedModule?.resolvedFileName).toBe('/project/node_modules/@types/react/jsx-runtime.d.ts')
})

test('createModuleResolver should resolve declaration package directory imports', () => {
  const syncRpc = createWorkspaceSyncRpc({
    '/project/node_modules/@types/react/index.d.ts': 'export = React',
    '/project/node_modules/@types/react/jsx-runtime.d.ts': "import './'",
  })
  const resolver = createModuleResolver(syncRpc, TypeScript)

  const result = resolver('./', '/project/node_modules/@types/react/jsx-runtime.d.ts', bundlerOptions)

  expect(result.resolvedModule?.extension).toBe('.d.ts')
  expect(result.resolvedModule?.resolvedFileName).toBe('/project/node_modules/@types/react/index.d.ts')
})

test('createModuleResolver should not resolve a missing relative target from a declaration package', () => {
  const syncRpc = createWorkspaceSyncRpc({
    '/project/node_modules/incomplete-library/index.d.ts': "export { MissingType } from './contracts/MissingType.js'",
  })
  const resolver = createModuleResolver(syncRpc, TypeScript)

  const result = resolver(
    './contracts/MissingType.js',
    '/project/node_modules/incomplete-library/index.d.ts',
    bundlerOptions,
  )

  expect(result.resolvedModule).toBeUndefined()
})

test('createModuleResolver should resolve a CommonJS package whose main entry is a directory', () => {
  const syncRpc = createWorkspaceSyncRpc({
    '/project/node_modules/chalk/package.json': JSON.stringify({ main: 'source' }),
    '/project/node_modules/chalk/source/index.js': 'module.exports = {}',
    '/project/src/main.ts': "import chalk from 'chalk'",
  })
  const resolver = createModuleResolver(syncRpc, TypeScript)

  const result = resolver('chalk', '/project/src/main.ts', {
    module: TypeScript.ModuleKind.NodeNext,
    moduleResolution: TypeScript.ModuleResolutionKind.NodeNext,
  })

  expect(result.resolvedModule?.extension).toBe('.js')
  expect(result.resolvedModule?.resolvedFileName).toBe('/project/node_modules/chalk/source/index.js')
})
