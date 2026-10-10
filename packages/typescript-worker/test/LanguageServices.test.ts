import { expect, test } from '@jest/globals'
import * as TypeScript from 'typescript'
import * as LanguageServices from '../src/parts/LanguageServices/LanguageServices.ts'

test('creates one document registry for each TypeScript language service context', () => {
  const fs = {} as any
  const client = { invokeSync() {} }
  LanguageServices.set(1, fs, client, TypeScript)

  const first = LanguageServices.get(1)
  const snapshot = TypeScript.ScriptSnapshot.fromString('export const value = 1')
  const settings = { target: TypeScript.ScriptTarget.ES2020 }
  const lowercase = first.documentRegistry.acquireDocument(
    '/workspace/file.ts',
    settings,
    snapshot,
    '1',
    TypeScript.ScriptKind.TS,
  )
  const uppercase = first.documentRegistry.acquireDocument(
    '/workspace/File.ts',
    settings,
    snapshot,
    '1',
    TypeScript.ScriptKind.TS,
  )
  expect(uppercase).not.toBe(lowercase)
  first.documentRegistry.releaseDocument('/workspace/file.ts', settings, TypeScript.ScriptKind.TS, undefined)
  first.documentRegistry.releaseDocument('/workspace/File.ts', settings, TypeScript.ScriptKind.TS, undefined)
  expect(first.documentRegistry.reportStats()).toBe('[]')

  LanguageServices.set(1, fs, client, TypeScript)
  expect(LanguageServices.get(1).documentRegistry).not.toBe(first.documentRegistry)
})
