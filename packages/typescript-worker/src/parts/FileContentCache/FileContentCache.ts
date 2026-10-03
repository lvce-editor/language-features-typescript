import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex } from '@noble/hashes/utils.js'

export interface SyncHandle {
  close(): void
  flush(): void
  getSize(): number
  read(buffer: Uint8Array, options: { at: number }): number
  truncate(size: number): void
  write(buffer: Uint8Array, options: { at: number }): number
}

export interface FileContentCache {
  close(): void
  get(hash: string): string | undefined
  set(hash: string, content: string): void
}

const headerSize = 68
const maxBytes = 16 * 1024 * 1024
const maxEntries = 4096
const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8', { fatal: true })
const isHash = (hash: string): boolean => /^[a-f0-9]{64}$/.test(hash)

/** One exclusively owned file; bounded journal entries contain length, SHA256 and UTF-8 bytes. */
export const createFileContentCache = (handle: SyncHandle): FileContentCache => {
  const entries = new Map<string, { offset: number; size: number }>()
  let end = 0
  let closed = false
  const close = (): void => {
    if (closed) return
    closed = true
    entries.clear()
    try {
      handle.close()
    } catch {
      // A failed optional cache must not affect language features.
    }
  }
  try {
    const size = handle.getSize()
    if (size <= maxBytes) {
      const header = new Uint8Array(headerSize)
      while (end + headerSize <= size && entries.size < maxEntries) {
        if (handle.read(header, { at: end }) !== headerSize) break
        const length = new DataView(header.buffer).getUint32(0, true)
        const hash = decoder.decode(header.subarray(4))
        if (!isHash(hash) || length > size - end - headerSize) break
        entries.set(hash, { offset: end + headerSize, size: length })
        end += headerSize + length
      }
    }
    // Discard incomplete tails (or oversized files) before appending.
    handle.truncate(end)
  } catch {
    close()
  }
  return {
    close,
    get(hash) {
      if (closed) return undefined
      const entry = entries.get(hash)
      if (!entry) return undefined
      try {
        const bytes = new Uint8Array(entry.size)
        if (handle.read(bytes, { at: entry.offset }) !== entry.size || bytesToHex(sha256(bytes)) !== hash) {
          entries.delete(hash)
          return undefined
        }
        return decoder.decode(bytes)
      } catch {
        close()
        return undefined
      }
    },
    set(hash, content) {
      if (closed || !isHash(hash) || entries.has(hash) || content.length > maxBytes) return
      const bytes = encoder.encode(content)
      // The source may have changed after identity lookup. Never publish it under an earlier hash.
      if (bytes.length + headerSize > maxBytes || bytesToHex(sha256(bytes)) !== hash) return
      try {
        if (end + headerSize + bytes.length > maxBytes || entries.size >= maxEntries) {
          handle.truncate(0)
          entries.clear()
          end = 0
        }
        const header = new Uint8Array(headerSize)
        // An interrupted write leaves an invalid header, detected on the next open.
        if (handle.write(header, { at: end }) !== headerSize) throw new Error('Short cache header write')
        if (handle.write(bytes, { at: end + headerSize }) !== bytes.length) throw new Error('Short cache body write')
        handle.flush()
        new DataView(header.buffer).setUint32(0, bytes.length, true)
        header.set(encoder.encode(hash), 4)
        if (handle.write(header, { at: end }) !== headerSize) throw new Error('Short cache commit write')
        handle.flush()
        entries.set(hash, { offset: end + headerSize, size: bytes.length })
        end += headerSize + bytes.length
      } catch {
        close()
      }
    },
  }
}
