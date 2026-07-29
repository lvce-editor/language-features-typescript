import { test, expect, jest } from '@jest/globals'
import * as TypeScript from 'typescript'
import { createFileSystem } from '../src/parts/CreateFileSystem/CreateFileSystem.ts'
import { emptyTsconfig } from '../src/parts/EmptyTsConfig/EmptyTsConfig.ts'
import { create } from '../src/parts/TypeScriptLanguageHost/TypeScriptLanguageHost.ts'

test('create should return a language service host with proper methods', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => ['test.ts'],
    getScriptVersion: (uri: string) => '0',
    getVersion: () => '0',
    readFile: (uri: string) => 'file content',
    writeFile: (uri: string, content: string) => {},
  }

  const mockSyncRpc = {
    invokeSync: (method: string, ...params: any[]) => {
      if (method === 'SyncApi.exists') {
        return true
      }
      if (method === 'SyncApi.readDirSync') {
        return []
      }
      if (method === 'SyncApi.readFileSync') {
        return 'file content'
      }
      throw new Error(`unexpected method ${method}`)
    },
  }

  const mockOptions = {
    errors: [],
    fileNames: [],
    options: {
      module: TypeScript.ModuleKind.ESNext,
      target: TypeScript.ScriptTarget.ES2020,
    },
  }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host).toBeDefined()
  expect(typeof host.getScriptKind).toBe('function')
  expect(typeof host.directoryExists).toBe('function')
  expect(typeof host.fileExists).toBe('function')
  expect(typeof host.readFile).toBe('function')
  expect(typeof host.getNewLine).toBe('function')
  expect(typeof host.readDirectory).toBe('function')
  expect(typeof host.getDirectories).toBe('function')
  expect(typeof host.useCaseSensitiveFileNames).toBe('function')
  expect(typeof host.getProjectVersion).toBe('function')
  expect(typeof host.getScriptFileNames).toBe('function')
  expect(typeof host.getScriptVersion).toBe('function')
  expect(typeof host.writeFile).toBe('function')
  expect(typeof host.getCompilationSettings).toBe('function')
  expect(typeof host.getCustomTransformers).toBe('function')
  expect(typeof host.getCurrentDirectory).toBe('function')
  expect(typeof host.getDefaultLibFileName).toBe('function')
  expect(typeof host.getScriptSnapshot).toBe('function')
  expect(typeof host.resolveModuleNameLiterals).toBe('function')
  expect(typeof host.getProjectReferences).toBe('function')
})

test('getScriptKind should return the kind matching the file extension', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    getScriptVersion: (uri: string) => '0',
    getVersion: () => '0',
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { errors: [], fileNames: [], options: {} }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.getScriptKind?.('test.ts')).toBe(TypeScript.ScriptKind.TS)
  expect(host.getScriptKind?.('test.tsx')).toBe(TypeScript.ScriptKind.TSX)
  expect(host.getScriptKind?.('test.js')).toBe(TypeScript.ScriptKind.JS)
  expect(host.getScriptKind?.('test.mjs')).toBe(TypeScript.ScriptKind.JS)
  expect(host.getScriptKind?.('test.cjs')).toBe(TypeScript.ScriptKind.JS)
  expect(host.getScriptKind?.('test.jsx')).toBe(TypeScript.ScriptKind.JSX)
  expect(host.getScriptKind?.('test.json')).toBe(TypeScript.ScriptKind.JSON)
  expect(host.getScriptKind?.('test.unknown')).toBe(TypeScript.ScriptKind.TS)
})

test('directoryExists should always return true', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    getScriptVersion: (uri: string) => '0',
    getVersion: () => '0',
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { errors: [], fileNames: [], options: {} }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.directoryExists?.('/some/path')).toBe(true)
  expect(host.directoryExists?.('relative/path')).toBe(true)
})

test('fileExists should handle node_modules paths correctly', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    getScriptVersion: (uri: string) => '0',
    getVersion: () => '0',
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
  }

  const mockSyncRpc = {
    invokeSync: (method: string, path: string) => {
      if (method === 'SyncApi.exists') {
        return path !== 'non-existent-file'
      }
      return true
    },
  }

  const mockOptions = { errors: [], fileNames: [], options: {} }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.fileExists?.('node_modules/@typescript/lib/some-file')).toBe(false)
  expect(host.fileExists?.('node_modules/@types/typescript__lib/some-file')).toBe(false)
  expect(host.fileExists?.('regular-file.ts')).toBe(true)
  expect(host.fileExists?.('non-existent-file')).toBe(false)
})

test('readFile should return empty string', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    getScriptVersion: (uri: string) => '0',
    getVersion: () => '0',
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
  }

  const mockSyncRpc = {
    invokeSync: () => '',
  }

  const mockOptions = { errors: [], fileNames: [], options: {} }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.readFile?.('any-file.ts')).toBe('')
})

test('getNewLine should return newline character', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    getScriptVersion: (uri: string) => '0',
    getVersion: () => '0',
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { errors: [], fileNames: [], options: {} }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.getNewLine?.()).toBe('\n')
})

test('readDirectory should call syncRpc', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    getScriptVersion: (uri: string) => '0',
    getVersion: () => '0',
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
  }

  const mockSyncRpc = {
    invokeSync: (method: string, path: string) => {
      if (method === 'SyncApi.readDirSync') {
        return ['file1.ts', 'file2.ts']
      }
      return true
    },
  }

  const mockOptions = { errors: [], fileNames: [], options: {} }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  const result = host.readDirectory?.('/some/path')
  expect(result).toEqual(['file1.ts', 'file2.ts'])
})

test('getDirectories should handle @types paths', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    getScriptVersion: (uri: string) => '0',
    getVersion: () => '0',
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { errors: [], fileNames: [], options: {} }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.getDirectories?.('/node_modules/@types')).toEqual([])
  expect(host.getDirectories?.('node_modules/@types')).toEqual([])
  expect(host.getDirectories?.('/other/path')).toEqual([])
})

test('useCaseSensitiveFileNames should return true', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    getScriptVersion: (uri: string) => '0',
    getVersion: () => '0',
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { errors: [], fileNames: [], options: {} }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.useCaseSensitiveFileNames?.()).toBe(true)
})

test('getProjectVersion should return string version', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    getScriptVersion: (uri: string) => '0',
    getVersion: () => '42',
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { errors: [], fileNames: [], options: {} }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.getProjectVersion?.()).toBe('42')
})

test('getScriptFileNames should return configured and file system script names', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => ['file1.ts', 'file2.ts'],
    getScriptVersion: (uri: string) => '0',
    getVersion: () => '0',
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { errors: [], fileNames: ['configured.ts', 'file1.ts'], options: {} }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.getScriptFileNames?.()).toEqual(['configured.ts', 'file1.ts', 'file2.ts'])
})

test('getScriptVersion should return string version', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    getScriptVersion: (uri: string) => '7',
    getVersion: () => '0',
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { errors: [], fileNames: [], options: {} }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.getScriptVersion?.('any-file.ts')).toBe('7')
})

test('language service should discover and refresh in-memory files', () => {
  const fileSystem = createFileSystem()
  const mockSyncRpc = {
    invokeSync(method: string) {
      if (method === 'SyncApi.exists') {
        return false
      }
      if (method === 'SyncApi.readDirSync') {
        return []
      }
      if (method === 'SyncApi.readFileSync') {
        return ''
      }
      throw new Error(`unexpected method ${method}`)
    },
  }
  const mockOptions = {
    errors: [],
    fileNames: [],
    options: {
      noLib: true,
      strict: true,
    },
  }
  const host = create(TypeScript, fileSystem, mockSyncRpc, mockOptions)
  const languageService = TypeScript.createLanguageService(host)
  const uri = 'fetch:///workspace/test.ts'

  fileSystem.writeFile(uri, "let value: number = ''")
  expect(languageService.getSemanticDiagnostics(uri).map((diagnostic) => diagnostic.code)).toEqual([2322])

  fileSystem.writeFile(uri, 'let value: number = 1')
  expect(languageService.getSemanticDiagnostics(uri)).toEqual([])
})

test('default project should report JavaScript diagnostics', () => {
  const fileSystem = createFileSystem()
  const mockSyncRpc = {
    invokeSync(method: string) {
      if (method === 'SyncApi.exists') {
        return false
      }
      if (method === 'SyncApi.readDirSync') {
        return []
      }
      if (method === 'SyncApi.readFileSync') {
        return ''
      }
      throw new Error(`unexpected method ${method}`)
    },
  }
  const host = create(TypeScript, fileSystem, mockSyncRpc, {
    ...emptyTsconfig,
    options: {
      ...emptyTsconfig.options,
      noLib: true,
    },
  })
  const languageService = TypeScript.createLanguageService(host)
  const uri = 'fetch:///workspace/test.js'

  fileSystem.writeFile(uri, "let value = ''\nvalue++")

  expect(languageService.getSemanticDiagnostics(uri).map((diagnostic) => diagnostic.code)).toContain(2356)
})

test('React TSX project should use installed JSX declarations', () => {
  const uri = '/project/src/App.tsx'
  const files: Readonly<Record<string, string>> = {
    '/project/node_modules/@types/react/global.d.ts':
      'declare namespace JSX { interface IntrinsicElements { main: Record<string, unknown> } }',
    '/project/node_modules/@types/react/index.d.ts':
      "/// <reference path='global.d.ts' />\nexport = React\ndeclare namespace React {}",
    '/project/node_modules/@types/react/jsx-runtime.d.ts': "import './'",
    '/project/node_modules/@types/react/package.json': JSON.stringify({
      exports: {
        '.': {
          types: {
            default: './index.d.ts',
          },
        },
        './jsx-runtime': {
          types: {
            default: './jsx-runtime.d.ts',
          },
        },
      },
      name: '@types/react',
      types: 'index.d.ts',
      version: '18.2.0',
    }),
    '/project/node_modules/react/jsx-runtime.js': 'module.exports = {}',
    '/project/node_modules/react/package.json': JSON.stringify({
      exports: {
        './jsx-runtime': './jsx-runtime.js',
      },
      main: 'index.js',
    }),
  }
  const existingPaths = new Set(Object.keys(files))
  for (const fileName of Object.keys(files)) {
    let path = fileName
    while (path.includes('/')) {
      path = path.slice(0, path.lastIndexOf('/'))
      existingPaths.add(path)
    }
  }
  const syncRpc = {
    invokeSync(method: string, path: string) {
      if (method === 'SyncApi.exists') {
        return existingPaths.has(path)
      }
      if (method === 'SyncApi.readDirSync') {
        return []
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
  const fileSystem = createFileSystem()
  fileSystem.writeFile(uri, 'export const App = () => <main />')
  const host = create(TypeScript, fileSystem, syncRpc, {
    errors: [],
    fileNames: [uri],
    options: {
      jsx: TypeScript.JsxEmit.ReactJSX,
      module: TypeScript.ModuleKind.ESNext,
      moduleResolution: TypeScript.ModuleResolutionKind.Bundler,
      noLib: true,
      rootDir: '/project',
      skipLibCheck: true,
      strict: true,
    },
  })
  const languageService = TypeScript.createLanguageService(host)
  const sourceFileNames = languageService
    .getProgram()
    ?.getSourceFiles()
    .map((sourceFile) => sourceFile.fileName)

  expect(sourceFileNames).toContain('/project/node_modules/@types/react/index.d.ts')
  expect(sourceFileNames).toContain('/project/node_modules/@types/react/global.d.ts')
  expect(languageService.getSemanticDiagnostics(uri)).toEqual([])
})

test('writeFile should throw error', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    getScriptVersion: (uri: string) => '0',
    getVersion: () => '0',
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { errors: [], fileNames: [], options: {} }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(() => {
    host.writeFile?.('file.ts', 'content')
  }).toThrow('not implemented')
})

test('getCompilationSettings should return options', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    getScriptVersion: (uri: string) => '0',
    getVersion: () => '0',
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = {
    errors: [],
    fileNames: [],
    options: {
      module: TypeScript.ModuleKind.ESNext,
      target: TypeScript.ScriptTarget.ES2020,
    },
  }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.getCompilationSettings?.()).toEqual(mockOptions.options)
})

test('getCustomTransformers should throw error', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    getScriptVersion: (uri: string) => '0',
    getVersion: () => '0',
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { errors: [], fileNames: [], options: {} }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(() => {
    host.getCustomTransformers?.()
  }).toThrow('not implemented')
})

test('getCurrentDirectory should return configured root directory', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    getScriptVersion: (uri: string) => '0',
    getVersion: () => '0',
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { errors: [], fileNames: [], options: { rootDir: '/project' } }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.getCurrentDirectory?.()).toBe('/project')
})

test('getDefaultLibFileName should return TypeScript default lib', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    getScriptVersion: (uri: string) => '0',
    getVersion: () => '0',
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { errors: [], fileNames: [], options: {} }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  const result = host.getDefaultLibFileName?.({})
  expect(typeof result).toBe('string')
  expect(result).toContain('lib.')
})

test('getProjectReferences should return empty array', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    getScriptVersion: (uri: string) => '0',
    getVersion: () => '0',
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { errors: [], fileNames: [], options: {} }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.getProjectReferences?.()).toEqual([])
})
