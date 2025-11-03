import { test, expect, jest } from '@jest/globals'
import * as TypeScript from 'typescript'
import { create } from '../src/parts/TypeScriptLanguageHost/TypeScriptLanguageHost.ts'

test('create should return a language service host with proper methods', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => ['test.ts'],
    readFile: (uri: string) => 'file content',
    writeFile: (uri: string, content: string) => {},
    getVersion: () => '0',
    getScriptVersion: (uri: string) => '0',
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
    options: {
      target: TypeScript.ScriptTarget.ES2020,
      module: TypeScript.ModuleKind.ESNext,
    },
    fileNames: [],
    errors: [],
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

test('getScriptKind should return TS for all files', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
    getVersion: () => '0',
    getScriptVersion: (uri: string) => '0',
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { options: {}, fileNames: [], errors: [] }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.getScriptKind?.('test.ts')).toBe(TypeScript.ScriptKind.TS)
  expect(host.getScriptKind?.('test.js')).toBe(TypeScript.ScriptKind.TS)
  expect(host.getScriptKind?.('test.tsx')).toBe(TypeScript.ScriptKind.TS)
})

test('directoryExists should always return true', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
    getVersion: () => '0',
    getScriptVersion: (uri: string) => '0',
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { options: {}, fileNames: [], errors: [] }

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
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
    getVersion: () => '0',
    getScriptVersion: (uri: string) => '0',
  }

  const mockSyncRpc = {
    invokeSync: (method: string, path: string) => {
      if (method === 'SyncApi.exists') {
        return path !== 'non-existent-file'
      }
      return true
    },
  }

  const mockOptions = { options: {}, fileNames: [], errors: [] }

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
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
    getVersion: () => '0',
    getScriptVersion: (uri: string) => '0',
  }

  const mockSyncRpc = {
    invokeSync: () => '',
  }

  const mockOptions = { options: {}, fileNames: [], errors: [] }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.readFile?.('any-file.ts')).toBe('')
})

test('getNewLine should return newline character', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
    getVersion: () => '0',
    getScriptVersion: (uri: string) => '0',
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { options: {}, fileNames: [], errors: [] }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.getNewLine?.()).toBe('\n')
})

test('readDirectory should call syncRpc', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
    getVersion: () => '0',
    getScriptVersion: (uri: string) => '0',
  }

  const mockSyncRpc = {
    invokeSync: (method: string, path: string) => {
      if (method === 'SyncApi.readDirSync') {
        return ['file1.ts', 'file2.ts']
      }
      return true
    },
  }

  const mockOptions = { options: {}, fileNames: [], errors: [] }

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
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
    getVersion: () => '0',
    getScriptVersion: (uri: string) => '0',
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { options: {}, fileNames: [], errors: [] }

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
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
    getVersion: () => '0',
    getScriptVersion: (uri: string) => '0',
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { options: {}, fileNames: [], errors: [] }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.useCaseSensitiveFileNames?.()).toBe(true)
})

test('getProjectVersion should return string version', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
    getVersion: () => '0',
    getScriptVersion: (uri: string) => '0',
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { options: {}, fileNames: [], errors: [] }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.getProjectVersion?.()).toBe('0')
})

test('getScriptFileNames should return file system script names', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => ['file1.ts', 'file2.ts'],
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
    getVersion: () => '0',
    getScriptVersion: (uri: string) => '0',
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { options: {}, fileNames: [], errors: [] }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.getScriptFileNames?.()).toEqual(['file1.ts', 'file2.ts'])
})

test('getScriptVersion should return string version', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
    getVersion: () => '0',
    getScriptVersion: (uri: string) => '0',
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { options: {}, fileNames: [], errors: [] }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.getScriptVersion?.('any-file.ts')).toBe('0')
})

test('writeFile should throw error', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
    getVersion: () => '0',
    getScriptVersion: (uri: string) => '0',
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { options: {}, fileNames: [], errors: [] }

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
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
    getVersion: () => '0',
    getScriptVersion: (uri: string) => '0',
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = {
    options: {
      target: TypeScript.ScriptTarget.ES2020,
      module: TypeScript.ModuleKind.ESNext,
    },
    fileNames: [],
    errors: [],
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
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
    getVersion: () => '0',
    getScriptVersion: (uri: string) => '0',
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { options: {}, fileNames: [], errors: [] }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(() => {
    host.getCustomTransformers?.()
  }).toThrow('not implemented')
})

test('getCurrentDirectory should return empty string', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
    getVersion: () => '0',
    getScriptVersion: (uri: string) => '0',
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { options: {}, fileNames: [], errors: [] }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.getCurrentDirectory?.()).toBe('')
})

test('getDefaultLibFileName should return TypeScript default lib', () => {
  globalThis.rpc = {
    invoke: jest.fn(() => Promise.resolve()),
  }

  const mockFileSystem = {
    getScriptFileNames: () => [],
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
    getVersion: () => '0',
    getScriptVersion: (uri: string) => '0',
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { options: {}, fileNames: [], errors: [] }

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
    readFile: () => '',
    writeFile: (uri: string, content: string) => {},
    getVersion: () => '0',
    getScriptVersion: (uri: string) => '0',
  }

  const mockSyncRpc = {
    invokeSync: () => true,
  }

  const mockOptions = { options: {}, fileNames: [], errors: [] }

  const host = create(TypeScript, mockFileSystem, mockSyncRpc, mockOptions)

  expect(host.getProjectReferences?.()).toEqual([])
})
