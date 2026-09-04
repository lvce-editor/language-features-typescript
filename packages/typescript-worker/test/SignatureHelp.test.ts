import { expect, test } from '@jest/globals'
import * as TypeScript from 'typescript'
import { createFileSystem } from '../src/parts/CreateFileSystem/CreateFileSystem.ts'
import * as LanguageServices from '../src/parts/LanguageServices/LanguageServices.ts'
import { getSignatureHelp2 } from '../src/parts/SignatureHelp2/SignatureHelp2.ts'

test('getSignatureHelp2 returns signature and active parameter from the language service', async () => {
  const OriginalXmlHttpRequest = typeof XMLHttpRequest === 'undefined' ? undefined : XMLHttpRequest
  Object.defineProperty(globalThis, 'XMLHttpRequest', {
    configurable: true,
    value: class {
      readonly responseText = ''

      open(): void {}

      send(): void {}

      setRequestHeader(): void {}
    },
  })
  const fs = createFileSystem()
  const client = {
    invokeSync(method: string): any {
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
  LanguageServices.set(1, fs, client, TypeScript)
  const text = ['function greet(name: string, count: number): void {}', "greet('Ada', "].join('\n')
  const textDocument = {
    languageId: 'typescript',
    text,
    uri: '/signature-help-test.ts',
  }

  try {
    const result = await getSignatureHelp2(textDocument, text.length)

    expect(result?.activeParameter).toBe(1)
    expect(result?.activeSignature).toBe(0)
    expect(result?.signatures).toHaveLength(1)
    expect(result?.signatures[0].label).toBe('greet(name: string, count: number): void')
    expect(result?.signatures[0].parameters.map((parameter) => parameter.label)).toEqual([
      'name: string',
      'count: number',
    ])
  } finally {
    Object.defineProperty(globalThis, 'XMLHttpRequest', {
      configurable: true,
      value: OriginalXmlHttpRequest,
    })
  }
})
