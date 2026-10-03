import { expect, test } from '@jest/globals'
import { createFileContentCache, type SyncHandle } from '../src/parts/FileContentCache/FileContentCache.ts'

const hash = async (text: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}
const file = () => {
  const state = { bytes: new Uint8Array(), closes: 0, failWrite: false }
  const handle: SyncHandle = {
    close: () => {
      state.closes++
    },
    flush: () => {},
    getSize: () => state.bytes.length,
    read: (buffer, { at }) => {
      const bytes = state.bytes.subarray(at, at + buffer.length)
      buffer.set(bytes)
      return bytes.length
    },
    truncate: (size) => {
      const next = new Uint8Array(size)
      next.set(state.bytes.subarray(0, size))
      state.bytes = next
    },
    write: (buffer, { at }) => {
      if (state.failWrite) throw new Error('quota exceeded')
      if (at + buffer.length > state.bytes.length) handle.truncate(at + buffer.length)
      state.bytes.set(buffer, at)
      return buffer.length
    },
  }
  return { handle, state }
}

test('reopens unicode and empty contents without reading their source', async () => {
  const { handle, state } = file()
  const cache = createFileContentCache(handle)
  cache.set(await hash('hello 🌍'), 'hello 🌍')
  cache.set(await hash(''), '')
  cache.close()
  cache.close()
  expect(state.closes).toBe(1)
  const reopened = createFileContentCache(handle)
  expect(reopened.get(await hash('hello 🌍'))).toBe('hello 🌍')
  expect(reopened.get(await hash(''))).toBe('')
  expect(reopened.get(await hash('new contents'))).toBeUndefined()
  reopened.close()
})

test('does not publish source contents that changed after hash lookup', async () => {
  const { handle, state } = file()
  const cache = createFileContentCache(handle)
  cache.set(await hash('before'), 'after')
  expect(cache.get(await hash('before'))).toBeUndefined()
  expect(state.bytes).toHaveLength(0)
  cache.set(await hash('after'), 'after')
  expect(cache.get(await hash('after'))).toBe('after')
  cache.close()
})

test('rejects corruption and permits replacement with verified contents', async () => {
  const { handle, state } = file()
  const cache = createFileContentCache(handle)
  cache.set(await hash('good'), 'good')
  state.bytes[68] ^= 1
  expect(cache.get(await hash('good'))).toBeUndefined()
  cache.set(await hash('good'), 'good')
  expect(cache.get(await hash('good'))).toBe('good')
  cache.close()
})

test('recovers from an incomplete tail without losing earlier complete entries', async () => {
  const { handle, state } = file()
  const cache = createFileContentCache(handle)
  cache.set(await hash('good'), 'good')
  const committed = state.bytes.length
  handle.write(new Uint8Array(90), { at: committed })
  cache.close()
  const reopened = createFileContentCache(handle)
  expect(state.bytes).toHaveLength(committed)
  expect(reopened.get(await hash('good'))).toBe('good')
  reopened.close()
})

test('quota failures close the handle and disable optional cache access', async () => {
  const { handle, state } = file()
  const cache = createFileContentCache(handle)
  state.failWrite = true
  const key = await hash('text')
  expect(() => cache.set(key, 'text')).not.toThrow()
  expect(cache.get(await hash('text'))).toBeUndefined()
  cache.close()
  expect(state.closes).toBe(1)
})

test('resets oversized storage and bounds retained entries', async () => {
  const { handle, state } = file()
  handle.truncate(17 * 1024 * 1024)
  const cache = createFileContentCache(handle)
  expect(state.bytes).toHaveLength(0)
  for (let i = 0; i < 4097; i++) cache.set(await hash(String(i)), String(i))
  expect(cache.get(await hash('0'))).toBeUndefined()
  expect(cache.get(await hash('4096'))).toBe('4096')
  expect(state.bytes.length).toBeLessThan(100)
  cache.close()
})
