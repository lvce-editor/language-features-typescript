import { expect, test } from '@jest/globals'
import type { SyncHandle } from '../src/parts/FileContentCache/FileContentCache.ts'
import { createFileMetadataCache } from '../src/parts/FileMetadataCache/FileMetadataCache.ts'

const createStorage = () => {
  const bytes: number[] = []
  const handle: SyncHandle = {
    close() {},
    flush() {},
    getSize: () => bytes.length,
    read(buffer, { at }) {
      const slice = bytes.slice(at, at + buffer.length)
      buffer.set(slice)
      return slice.length
    },
    truncate(size) {
      bytes.length = size
    },
    write(buffer, { at }) {
      for (const [index, value] of buffer.entries()) bytes[at + index] = value
      return buffer.length
    },
  }
  return { bytes, handle }
}

test('persists dependency metadata between cache workers', async () => {
  const storage = createStorage()
  const cache = createFileMetadataCache(storage.handle)
  cache.set('file:///project', '{"lockHash":"hash","hashes":{}}')
  await Promise.resolve()
  cache.close()

  const resumed = createFileMetadataCache(storage.handle)
  expect(resumed.get('file:///project')).toBe('{"lockHash":"hash","hashes":{}}')
  resumed.close()
})

test('discards malformed metadata without exposing partial cache state', () => {
  const storage = createStorage()
  storage.bytes.push(123, 34, 98, 114, 111, 107, 101, 110)
  const cache = createFileMetadataCache(storage.handle)
  expect(cache.get('project')).toBeUndefined()
  expect(storage.bytes).toEqual([])
  cache.close()
})

test('flushes queued writes when closed and ignores later writes', () => {
  const storage = createStorage()
  const cache = createFileMetadataCache(storage.handle)
  cache.set('project', 'value')
  cache.close()
  cache.close()
  cache.set('project', 'updated')
  expect(cache.get('project')).toBeUndefined()
  const resumed = createFileMetadataCache(storage.handle)
  expect(resumed.get('project')).toBe('value')
  resumed.close()
})

test('discards short reads and entries with non-string values', () => {
  const shortRead = createStorage()
  shortRead.bytes.push(123, 125)
  shortRead.handle.read = () => 1
  const shortCache = createFileMetadataCache(shortRead.handle)
  expect(shortCache.get('project')).toBeUndefined()
  expect(shortRead.bytes).toEqual([])

  const invalidEntry = createStorage()
  invalidEntry.bytes.push(...new TextEncoder().encode('{"project":null}'))
  const invalidCache = createFileMetadataCache(invalidEntry.handle)
  expect(invalidCache.get('project')).toBeUndefined()
  expect(invalidEntry.bytes).toEqual([])

  const arrayValue = createStorage()
  arrayValue.bytes.push(...new TextEncoder().encode('[]'))
  const invalidArray = createFileMetadataCache(arrayValue.handle)
  expect(invalidArray.get('project')).toBeUndefined()
  expect(arrayValue.bytes).toEqual([])
})

test('coalesces metadata updates made before the next microtask', async () => {
  const storage = createStorage()
  const cache = createFileMetadataCache(storage.handle)
  cache.set('first', 'one')
  cache.set('second', 'two')
  await Promise.resolve()
  cache.close()
  const resumed = createFileMetadataCache(storage.handle)
  expect(resumed.get('first')).toBe('one')
  expect(resumed.get('second')).toBe('two')
  resumed.close()
})

test('closes the metadata cache when storage reads or write operations fail', async () => {
  const readFailure = createStorage()
  readFailure.handle.getSize = () => {
    throw new Error('Storage unavailable')
  }
  readFailure.handle.truncate = () => {
    throw new Error('Storage unavailable')
  }
  const failedRead = createFileMetadataCache(readFailure.handle)
  expect(failedRead.get('project')).toBeUndefined()
  failedRead.set('project', 'value')
  expect(failedRead.get('project')).toBeUndefined()

  const shortWrite = createStorage()
  shortWrite.handle.write = () => 0
  const failedWrite = createFileMetadataCache(shortWrite.handle)
  failedWrite.set('project', 'value')
  await Promise.resolve()
  expect(failedWrite.get('project')).toBeUndefined()

  const flushFailure = createStorage()
  flushFailure.handle.flush = () => {
    throw new Error('Storage unavailable')
  }
  const failedFlush = createFileMetadataCache(flushFailure.handle)
  failedFlush.set('project', 'value')
  await Promise.resolve()
  expect(failedFlush.get('project')).toBeUndefined()
})

test('does not replace metadata when its serialized size exceeds the limit', async () => {
  const storage = createStorage()
  const cache = createFileMetadataCache(storage.handle)
  cache.set('project', 'x'.repeat(4 * 1024 * 1024))
  await Promise.resolve()
  expect(cache.get('project')).toHaveLength(4 * 1024 * 1024)
  cache.close()
})
