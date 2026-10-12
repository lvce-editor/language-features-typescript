import type { SyncHandle } from '../FileContentCache/FileContentCache.ts'

export interface FileMetadataCache {
  close(): void
  get(key: string): string | undefined
  set(key: string, value: string): void
}

const maxBytes = 4 * 1024 * 1024

/** Small best-effort JSON store. Invalid or interrupted metadata is discarded. */
export const createFileMetadataCache = (handle: SyncHandle): FileMetadataCache => {
  let closed = false
  let writePending = false
  const values = new Map<string, string>()
  const write = (): void => {
    try {
      const bytes = new TextEncoder().encode(JSON.stringify(Object.fromEntries(values)))
      if (bytes.length > maxBytes) return
      handle.truncate(0)
      if (handle.write(bytes, { at: 0 }) !== bytes.length) throw new Error('Short metadata write')
      handle.flush()
    } catch {
      closed = true
      values.clear()
      try {
        handle.close()
      } catch {
        // A failed optional cache must not affect language features.
      }
    }
  }
  const close = (): void => {
    if (closed) return
    if (writePending) write()
    writePending = false
    closed = true
    values.clear()
    try {
      handle.close()
    } catch {
      // Optional cache failures must not affect language features.
    }
  }
  try {
    const size = handle.getSize()
    if (size > 0 && size <= maxBytes) {
      const bytes = new Uint8Array(size)
      if (handle.read(bytes, { at: 0 }) !== size) throw new Error('Short metadata read')
      const parsed: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid metadata')
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value !== 'string') throw new Error('Invalid metadata entry')
        values.set(key, value)
      }
    }
  } catch {
    values.clear()
    try {
      handle.truncate(0)
    } catch {
      close()
    }
  }
  return {
    close,
    get(key) {
      return closed ? undefined : values.get(key)
    },
    set(key, value) {
      if (closed) return
      values.set(key, value)
      if (writePending) return
      writePending = true
      queueMicrotask(() => {
        if (closed) return
        writePending = false
        write()
      })
    },
  }
}
