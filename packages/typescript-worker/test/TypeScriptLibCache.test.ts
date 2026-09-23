import { initialize, read, type TypeScriptLibManifest } from '../src/parts/TypeScriptLibCache/TypeScriptLibCache.ts'
import { afterEach, describe, expect, it, jest } from '@jest/globals'

const textEncoder = new TextEncoder()

const getManifest = async (hash: string, content: string): Promise<TypeScriptLibManifest> => {
  const bytes = textEncoder.encode(content)
  const digest = await crypto.subtle.digest('SHA-256', bytes.slice().buffer as ArrayBuffer)
  const sha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  return {
    files: [{ fileName: 'lib.d.ts', sha256, byteLength: bytes.byteLength }],
    hash,
    totalByteLength: bytes.byteLength,
  }
}

const createStorage = () => {
  const close = jest.fn()
  const files = new Map<string, Uint8Array>()
  const locks = new Map<string, Promise<unknown>>()
  const directory = {
    async getFileHandle(name: string, options?: { create?: boolean }) {
      if (!files.has(name) && !options?.create) {
        throw new Error('File does not exist')
      }
      if (!files.has(name)) {
        files.set(name, new Uint8Array())
      }
      return {
        async createSyncAccessHandle({ mode }: { mode: 'read-only' | 'readwrite-unsafe' }) {
          return {
            close,
            getSize() {
              return files.get(name)!.byteLength
            },
            read(buffer: Uint8Array, { at = 0 }: { at?: number } = {}) {
              const file = files.get(name)!
              const length = Math.max(0, Math.min(buffer.byteLength, file.byteLength - at))
              buffer.set(file.subarray(at, at + length))
              return length
            },
            write(buffer: Uint8Array, { at = 0 }: { at?: number } = {}) {
              if (mode === 'read-only') {
                throw new Error('File is read only')
              }
              const current = files.get(name)!
              const requiredLength = at + buffer.byteLength
              if (current.byteLength < requiredLength) {
                const expanded = new Uint8Array(requiredLength)
                expanded.set(current)
                files.set(name, expanded)
              }
              files.get(name)!.set(buffer, at)
              return buffer.byteLength
            },
            truncate(size: number) {
              if (mode === 'read-only') {
                throw new Error('File is read only')
              }
              const current = files.get(name)!
              const truncated = new Uint8Array(size)
              truncated.set(current.subarray(0, size))
              files.set(name, truncated)
            },
            flush() {},
          }
        },
      }
    },
  }
  const root = {
    async getDirectoryHandle() {
      return directory
    },
  }
  const navigatorMock = {
    locks: {
      request(name: string, callback: () => Promise<unknown>) {
        const previous = locks.get(name) || Promise.resolve()
        const next = previous.catch(() => {}).then(callback)
        locks.set(name, next)
        return next
      },
    },
    storage: {
      async getDirectory() {
        return root
      },
    },
  }
  return { files, navigatorMock, close }
}

describe('TypeScriptLibCache', () => {
  const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  const originalFetch = globalThis.fetch

  afterEach(() => {
    if (originalNavigator) {
      Object.defineProperty(globalThis, 'navigator', originalNavigator)
    } else {
      Reflect.deleteProperty(globalThis, 'navigator')
    }
    globalThis.fetch = originalFetch
  })

  it('populates once and serves warm reads synchronously without fetching libraries again', async () => {
    const storage = createStorage()
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: storage.navigatorMock })
    globalThis.fetch = jest.fn(async (_url: string | URL | Request, options?: RequestInit) => {
      // Match the development server, which transpiles declarations unless text is requested.
      const content =
        options?.headers && new Headers(options.headers).get('Accept') === 'text/plain'
          ? 'declare const value: string'
          : '                           '
      return new Response(content)
    })
    const manifest = await getManifest('first-hash', 'declare const value: string')

    const coldCache = await initialize(manifest)
    expect(read(coldCache, 'https://example.test/lib.d.ts')).toBe('declare const value: string')
    const warmCache = await initialize(manifest)
    expect(read(warmCache, 'https://example.test/lib.d.ts')).toBe('declare const value: string')
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('uses a different cache namespace when the TypeScript library hash changes', async () => {
    const storage = createStorage()
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: storage.navigatorMock })
    globalThis.fetch = jest
      .fn(async () => new Response(''))
      .mockResolvedValueOnce(new Response('declare const oldValue: string'))
      .mockResolvedValueOnce(new Response('declare const newValue: string'))
    const oldManifest = await getManifest('old-hash', 'declare const oldValue: string')
    const newManifest = await getManifest('new-hash', 'declare const newValue: string')

    const oldCache = await initialize(oldManifest)
    const newCache = await initialize(newManifest)

    expect(read(oldCache, 'https://example.test/lib.d.ts')).toBe('declare const oldValue: string')
    expect(read(newCache, 'https://example.test/lib.d.ts')).toBe('declare const newValue: string')
    expect(globalThis.fetch).toHaveBeenCalledTimes(2)
  })

  it('serializes concurrent initialization so library contents are fetched only once', async () => {
    const storage = createStorage()
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: storage.navigatorMock })
    globalThis.fetch = jest.fn(async () => new Response('declare const value: string'))
    const manifest = await getManifest('concurrent-hash', 'declare const value: string')

    const [cacheA, cacheB] = await Promise.all([initialize(manifest), initialize(manifest)])

    expect(read(cacheA, 'https://example.test/lib.d.ts')).toBe('declare const value: string')
    expect(read(cacheB, 'https://example.test/lib.d.ts')).toBe('declare const value: string')
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('rebuilds an incomplete cache before exposing its contents', async () => {
    const storage = createStorage()
    storage.files.set('interrupted-hash.bin', new Uint8Array(128 + 'declare const value: string'.length))
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: storage.navigatorMock })
    globalThis.fetch = jest.fn(async () => new Response('declare const value: string'))
    const manifest = await getManifest('interrupted-hash', 'declare const value: string')

    const cache = await initialize(manifest)

    expect(read(cache, 'https://example.test/lib.d.ts')).toBe('declare const value: string')
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('repairs cached content whose identity header is valid but body has changed', async () => {
    const storage = createStorage()
    const content = 'declare const value: string'
    const manifest = await getManifest('corrupt-hash', content)
    const file = new Uint8Array(128 + content.length)
    file.set(new TextEncoder().encode(`LVCE-TypeScript-Lib-Cache\n${manifest.hash}\n${manifest.totalByteLength}\n`))
    file.set(new TextEncoder().encode('declare const wrong: string'), 128)
    storage.files.set('corrupt-hash.bin', file)
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: storage.navigatorMock })
    globalThis.fetch = jest.fn(async () => new Response(content))

    const cache = await initialize(manifest)

    expect(read(cache, 'https://example.test/lib.d.ts')).toBe(content)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })
  it('closes a failed population handle and permits a successful retry', async () => {
    const storage = createStorage()
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: storage.navigatorMock })
    const content = 'declare const value: string'
    const manifest = await getManifest('retry-hash', content)
    globalThis.fetch = jest.fn(async () => new Response('', { status: 404 }))

    await expect(initialize(manifest)).rejects.toThrow('Failed to fetch TypeScript lib')
    expect(storage.close).toHaveBeenCalledTimes(1)

    globalThis.fetch = jest.fn(async () => new Response(content))
    const cache = await initialize(manifest)
    expect(read(cache, 'https://example.test/lib.d.ts')).toBe(content)
    cache.close()
    expect(storage.close).toHaveBeenCalledTimes(4)
  })
})
