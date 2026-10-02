import { describe, expect, it } from '@jest/globals'
import { updateStaticExtension } from '../src/updateStaticExtension.ts'

describe('updateStaticExtension', () => {
  it('uses the packaged extension worker URLs in static extension configuration', () => {
    const extensions = [
      {
        id: 'builtin.language-features-typescript',
        path: '/language-features-typescript/commit/extensions/builtin.language-features-typescript',
        rpc: [{ id: 'typescript-worker', url: '../../typescriptWorkerMain.js' }],
      },
      { id: 'builtin.language-basics-typescript' },
    ]
    const extensionManifest = {
      id: 'builtin.language-features-typescript',
      rpc: [{ id: 'typescript-worker', url: 'typescriptWorkerMain.js' }],
    }

    expect(updateStaticExtension(extensions, extensionManifest)).toEqual([
      {
        ...extensions[0],
        rpc: extensionManifest.rpc,
      },
      extensions[1],
    ])
  })

  it('throws when the packaged extension is absent from static configuration', () => {
    expect(() => updateStaticExtension([], { id: 'builtin.language-features-typescript' })).toThrow(
      'Static extension not found: builtin.language-features-typescript',
    )
  })
})
