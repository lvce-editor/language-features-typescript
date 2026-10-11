import { expect, test } from '@jest/globals'
import * as ts from 'typescript'
import { createFileSystem } from '../src/parts/CreateFileSystem/CreateFileSystem.ts'
import { create } from '../src/parts/TypeScriptLanguageHost/TypeScriptLanguageHost.ts'

test('editing a root reuses unchanged dependency resolutions and observes unsaved missing imports', async () => {
  const fs = createFileSystem()
  const files = new Map([
    ['/project/dependency.ts', "import { nested } from './nested.ts'; export const value = nested;"],
    ['/project/nested.ts', 'export const nested = 1;'],
  ])
  const roots = new Set(['/project/main.ts'])
  const references = new Set(roots)
  let reads = 0
  const client = {
    invokeSync(method: string, uri: string) {
      references.add(uri)
      if (method === 'SyncApi.exists') return fs.readFile(uri) !== undefined || files.has(uri)
      if (method === 'SyncApi.readFileSync') {
        reads++
        return fs.readFile(uri) ?? files.get(uri)
      }
      return []
    },
  }
  const host = create(
    ts,
    fs,
    client,
    {
      errors: [],
      fileNames: [...roots],
      options: {
        allowImportingTsExtensions: true,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        noLib: true,
      },
    },
    roots,
    references,
  )
  const service = ts.createLanguageService(host)
  try {
    const text = "import { value } from './dependency.ts'; const result: number = value;"
    fs.writeFile('/project/main.ts', text)
    expect(service.getSemanticDiagnostics('/project/main.ts')).toEqual([])
    await Promise.resolve()
    reads = 0
    fs.writeFile('/project/main.ts', text.replace('result: number', 'changed: number'))
    expect(service.getSemanticDiagnostics('/project/main.ts')).toEqual([])
    expect(reads).toBe(0)
    fs.writeFile('/project/main.ts', "import { value } from './missing.ts'; const result: number = value;")
    expect(service.getSemanticDiagnostics('/project/main.ts').map((item) => item.code)).toContain(2307)
    fs.writeFile('/project/missing.ts', 'export const value = "text";')
    expect(service.getSemanticDiagnostics('/project/main.ts').map((item) => item.code)).toEqual([2322])
    fs.writeFile('/project/missing.ts', 'export const value = 42;')
    expect(service.getSemanticDiagnostics('/project/main.ts')).toEqual([])
  } finally {
    service.dispose()
  }
})
