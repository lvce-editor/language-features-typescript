import { expect, test } from '@jest/globals'
import * as TypeScript from 'typescript'
import { createFileSystem } from '../src/parts/CreateFileSystem/CreateFileSystem.ts'
import { createTypeScriptLanguageService } from '../src/parts/CreateTypeScriptLanguageService/CreateTypeScriptLanguageService.ts'

const sharedFileName = '/workspace/node_modules/shared/index.d.ts'

const makeRpc = (files: Map<string, string>) => ({
  invokeSync(method: string, fileName: string) {
    if (method === 'SyncApi.exists') {
      return files.has(fileName) || files.keys().some((name) => name.startsWith(`${fileName}/`))
    }
    if (method === 'SyncApi.readFileSync') {
      const content = files.get(fileName)
      if (content === undefined) throw new Error(`File not found: ${fileName}`)
      return content
    }
    if (method === 'SyncApi.readDirSync') {
      const prefix = `${fileName}/`
      return [
        ...new Set(
          files
            .keys()
            .filter((name) => name.startsWith(prefix))
            .map((name) => name.slice(prefix.length).split('/', 1)[0]),
        ),
      ]
    }
    throw new Error(`Unexpected RPC method: ${method}`)
  },
})

const makeConfig = (project: string, strictNullChecks: boolean) => ({
  errors: [],
  fileNames: [`/workspace/${project}/main.ts`],
  options: {
    module: TypeScript.ModuleKind.ESNext,
    moduleResolution: TypeScript.ModuleResolutionKind.Bundler,
    noLib: true,
    strictNullChecks,
    types: [],
  },
})

test('shares compatible documents and preserves edits, option-specific diagnostics, and surviving services', () => {
  const files = new Map([
    ['/workspace/node_modules/shared/package.json', '{"types":"index.d.ts"}'],
    [sharedFileName, 'export const value: number | undefined = 1'],
    ['/workspace/project-a/main.ts', "import { value } from 'shared'; export const result: number = value"],
    ['/workspace/project-b/main.ts', "import { value } from 'shared'; export const result: number = value"],
  ])
  const fs = createFileSystem()
  const rpc = makeRpc(files)
  const registry = TypeScript.createDocumentRegistry(true, '')
  const first = createTypeScriptLanguageService(TypeScript, fs, rpc, makeConfig('project-a', true), registry)
  const second = createTypeScriptLanguageService(TypeScript, fs, rpc, makeConfig('project-b', false), registry)

  expect(first.getSemanticDiagnostics('/workspace/project-a/main.ts').map((diagnostic) => diagnostic.code)).toContain(
    2322,
  )
  expect(second.getSemanticDiagnostics('/workspace/project-b/main.ts')).toEqual([])

  const firstSource = first.getProgram()?.getSourceFile(sharedFileName)
  const secondSource = second.getProgram()?.getSourceFile(sharedFileName)
  expect(firstSource).toBeDefined()
  expect(secondSource).toBe(firstSource)

  fs.writeFile(sharedFileName, "export const value: string = 'updated'")
  expect(first.getSemanticDiagnostics('/workspace/project-a/main.ts').map((diagnostic) => diagnostic.code)).toContain(
    2322,
  )
  expect(second.getSemanticDiagnostics('/workspace/project-b/main.ts').map((diagnostic) => diagnostic.code)).toContain(
    2322,
  )
  const updatedSource = first.getProgram()?.getSourceFile(sharedFileName) as
    (TypeScript.SourceFile & { version: string }) | undefined
  expect(updatedSource?.version).not.toBe(
    (firstSource as (TypeScript.SourceFile & { version: string }) | undefined)?.version,
  )

  first.dispose()
  expect(second.getSemanticDiagnostics('/workspace/project-b/main.ts').map((diagnostic) => diagnostic.code)).toContain(
    2322,
  )
  second.dispose()
  expect(JSON.parse(registry.reportStats())).toEqual([])
})

test('keeps different script kinds, path casing, and source-file compiler options in separate registry entries', () => {
  const registry = TypeScript.createDocumentRegistry(true, '')
  const options = { target: TypeScript.ScriptTarget.ES2020 }
  const snapshot = TypeScript.ScriptSnapshot.fromString('export const value = 1')
  const lowerCase = registry.acquireDocument('/workspace/case.ts', options, snapshot, '1', TypeScript.ScriptKind.TS)
  const otherCase = registry.acquireDocument('/workspace/Case.ts', options, snapshot, '1', TypeScript.ScriptKind.TS)
  const otherScriptKind = registry.acquireDocument(
    '/workspace/case.js',
    options,
    snapshot,
    '1',
    TypeScript.ScriptKind.JS,
  )
  const otherTarget = registry.acquireDocument(
    '/workspace/case.ts',
    { target: TypeScript.ScriptTarget.ES2015 },
    snapshot,
    '1',
    TypeScript.ScriptKind.TS,
  )

  expect(otherCase).not.toBe(lowerCase)
  expect(otherScriptKind).not.toBe(lowerCase)
  expect((otherScriptKind as TypeScript.SourceFile & { scriptKind: TypeScript.ScriptKind }).scriptKind).toBe(
    TypeScript.ScriptKind.JS,
  )
  expect(otherTarget).not.toBe(lowerCase)

  registry.releaseDocument('/workspace/case.ts', options, TypeScript.ScriptKind.TS, undefined)
  registry.releaseDocument('/workspace/Case.ts', options, TypeScript.ScriptKind.TS, undefined)
  registry.releaseDocument('/workspace/case.js', options, TypeScript.ScriptKind.JS, undefined)
  registry.releaseDocument(
    '/workspace/case.ts',
    { target: TypeScript.ScriptTarget.ES2015 },
    TypeScript.ScriptKind.TS,
    undefined,
  )
  expect(JSON.parse(registry.reportStats())).toEqual([])
})
