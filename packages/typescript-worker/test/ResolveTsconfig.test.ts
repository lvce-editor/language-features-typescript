import { test, expect } from '@jest/globals'
import * as TypeScript from 'typescript'
import { resolveTsconfig } from '../src/parts/ResolveTsconfig/ResolveTsconfig.ts'

test('resolveTsconfig should return empty tsconfig for empty path', () => {
  const result = resolveTsconfig(
    '',
    {},
    () => '',
    () => [],
    () => true,
    TypeScript,
  )

  expect(result).toBeDefined()
  expect(result.options).toBeDefined()
  expect(result.options.allowJs).toBe(true)
  expect(result.options.checkJs).toBe(true)
  expect(result.errors).toEqual([])
  expect(result.fileNames).toEqual([])
})

test('resolveTsconfig should parse valid tsconfig', () => {
  const mockTsconfig = {
    compilerOptions: {
      module: 'esnext',
      strict: true,
      target: 'es2020',
    },
    include: ['src/**/*'],
  }

  const mockReadFile = (uri: string): string => {
    if (uri.endsWith('tsconfig.json')) {
      return JSON.stringify(mockTsconfig)
    }
    return ''
  }

  const mockReadDir = (uri: string): readonly string[] => {
    if (uri === '/project') {
      return ['src']
    }
    if (uri === '/project/src') {
      return ['index.ts', 'utils.ts']
    }
    return []
  }

  const mockFileExists = (uri: string): boolean => {
    return uri.endsWith('.ts') || uri.endsWith('.json')
  }

  const result = resolveTsconfig(
    '/project/tsconfig.json',
    mockTsconfig,
    mockReadFile,
    mockReadDir,
    mockFileExists,
    TypeScript,
  )

  expect(result).toBeDefined()
  expect(result.options).toBeDefined()
  expect(result.options.target).toBe(TypeScript.ScriptTarget.ES2020)
  expect(result.options.module).toBe(TypeScript.ModuleKind.ESNext)
  expect(result.options.strict).toBe(true)
  expect(result.options.allowJs).toBe(true)
  expect(result.options.checkJs).toBe(true)
  expect(result.errors).toEqual([])
  expect(Array.isArray(result.fileNames)).toBe(true)
})

test('resolveTsconfig should handle include patterns', () => {
  const mockTsconfig = {
    compilerOptions: {
      target: 'es2015',
    },
    include: ['src/**/*', 'tests/**/*'],
  }

  const mockReadFile = (uri: string): string => {
    if (uri.endsWith('tsconfig.json')) {
      return JSON.stringify(mockTsconfig)
    }
    return ''
  }

  const mockReadDir = (uri: string): readonly string[] => {
    if (uri === '/project') {
      return ['src', 'tests']
    }
    if (uri === '/project/src') {
      return ['index.ts', 'utils.ts']
    }
    if (uri === '/project/tests') {
      return ['test.ts']
    }
    return []
  }

  const mockFileExists = (uri: string): boolean => {
    return uri.endsWith('.ts')
  }

  const result = resolveTsconfig(
    '/project/tsconfig.json',
    mockTsconfig,
    mockReadFile,
    mockReadDir,
    mockFileExists,
    TypeScript,
  )

  expect(result).toBeDefined()
  expect(result.options).toBeDefined()
  expect(result.options.target).toBe(TypeScript.ScriptTarget.ES2015)
  expect(result.errors).toEqual([])
  expect(Array.isArray(result.fileNames)).toBe(true)
})

test('resolveTsconfig should set rootDir from tsconfig path', () => {
  const mockTsconfig = {
    compilerOptions: {
      target: 'es2020',
    },
    include: ['src/**/*'],
  }

  const mockReadFile = (uri: string): string => {
    if (uri.endsWith('tsconfig.json')) {
      return JSON.stringify(mockTsconfig)
    }
    return ''
  }

  const mockReadDir = (uri: string): readonly string[] => {
    if (uri === '/project') {
      return ['src']
    }
    if (uri === '/project/src') {
      return ['index.ts']
    }
    return []
  }

  const mockFileExists = (uri: string): boolean => {
    return uri.endsWith('.ts')
  }

  const result = resolveTsconfig(
    '/project/tsconfig.json',
    mockTsconfig,
    mockReadFile,
    mockReadDir,
    mockFileExists,
    TypeScript,
  )

  expect(result).toBeDefined()
  expect(result.options.rootDir).toBe('/project')
})

test('resolveTsconfig should handle missing include property', () => {
  const mockTsconfig = {
    compilerOptions: {
      target: 'es2020',
    },
  }

  const mockReadFile = (uri: string): string => {
    if (uri.endsWith('tsconfig.json')) {
      return JSON.stringify(mockTsconfig)
    }
    return ''
  }

  const mockReadDir = (uri: string): readonly string[] => {
    if (uri === '/project') {
      return ['src']
    }
    if (uri === '/project/src') {
      return ['index.ts']
    }
    return []
  }

  const mockFileExists = (uri: string): boolean => {
    return uri.endsWith('.ts')
  }

  const result = resolveTsconfig(
    '/project/tsconfig.json',
    mockTsconfig,
    mockReadFile,
    mockReadDir,
    mockFileExists,
    TypeScript,
  )

  expect(result).toBeDefined()
  expect(result.options).toBeDefined()
  expect(result.errors).toEqual([])
  expect(Array.isArray(result.fileNames)).toBe(true)
})

test('resolveTsconfig should return empty tsconfig on error', () => {
  const mockTsconfig = {
    compilerOptions: {
      target: 'invalid-target',
    },
  }

  const mockReadFile = (uri: string): string => {
    throw new Error('File read error')
  }

  const mockReadDir = (uri: string): readonly string[] => {
    return []
  }

  const mockFileExists = (uri: string): boolean => {
    return false
  }

  const result = resolveTsconfig(
    '/project/tsconfig.json',
    mockTsconfig,
    mockReadFile,
    mockReadDir,
    mockFileExists,
    TypeScript,
  )

  expect(result).toBeDefined()
  expect(result.options).toBeDefined()
  expect(result.errors).toEqual([])
  expect(result.fileNames).toEqual([])
})

test('resolveTsconfig should handle complex tsconfig with multiple options', () => {
  const mockTsconfig = {
    compilerOptions: {
      allowUnreachableCode: false,
      allowUnusedLabels: false,
      alwaysStrict: true,
      exactOptionalPropertyTypes: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      noFallthroughCasesInSwitch: true,
      noImplicitAny: true,
      noImplicitOverride: true,
      noImplicitReturns: true,
      noImplicitThis: true,
      noPropertyAccessFromIndexSignature: true,
      noUncheckedIndexedAccess: true,
      strict: true,
      strictFunctionTypes: true,
      strictNullChecks: true,
      target: 'es2020',
      useUnknownInCatchVariables: true,
    },
    exclude: ['node_modules', 'dist'],
    include: ['src/**/*'],
  }

  const mockReadFile = (uri: string): string => {
    if (uri.endsWith('tsconfig.json')) {
      return JSON.stringify(mockTsconfig)
    }
    return ''
  }

  const mockReadDir = (uri: string): readonly string[] => {
    if (uri === '/project') {
      return ['src']
    }
    if (uri === '/project/src') {
      return ['index.ts', 'utils.ts', 'types.ts']
    }
    return []
  }

  const mockFileExists = (uri: string): boolean => {
    return uri.endsWith('.ts')
  }

  const result = resolveTsconfig(
    '/project/tsconfig.json',
    mockTsconfig,
    mockReadFile,
    mockReadDir,
    mockFileExists,
    TypeScript,
  )

  expect(result).toBeDefined()
  expect(result.options).toBeDefined()
  expect(result.options.target).toBe(TypeScript.ScriptTarget.ES2020)
  expect(result.options.module).toBe(TypeScript.ModuleKind.ESNext)
  expect(result.options.moduleResolution).toBe(TypeScript.ModuleResolutionKind.Bundler)
  expect(result.options.strict).toBe(true)
  expect(result.options.noImplicitAny).toBe(true)
  expect(result.options.strictNullChecks).toBe(true)
  expect(result.options.strictFunctionTypes).toBe(true)
  expect(result.options.noImplicitReturns).toBe(true)
  expect(result.options.noFallthroughCasesInSwitch).toBe(true)
  expect(result.options.noUncheckedIndexedAccess).toBe(true)
  expect(result.options.noImplicitOverride).toBe(true)
  expect(result.options.allowUnusedLabels).toBe(false)
  expect(result.options.allowUnreachableCode).toBe(false)
  expect(result.options.exactOptionalPropertyTypes).toBe(true)
  expect(result.options.noPropertyAccessFromIndexSignature).toBe(true)
  expect(result.options.noImplicitThis).toBe(true)
  expect(result.options.useUnknownInCatchVariables).toBe(true)
  expect(result.options.alwaysStrict).toBe(true)
  expect(result.errors).toEqual([])
  expect(Array.isArray(result.fileNames)).toBe(true)
})
