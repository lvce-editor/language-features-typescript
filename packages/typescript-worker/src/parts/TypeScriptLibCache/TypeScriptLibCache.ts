import * as GetLibFileUrl from '../GetLibFileUrl/GetLibFileUrl.ts'

export interface TypeScriptLibManifest {
  files: Array<{
    fileName: string
    sha256: string
    byteLength: number
  }>
  hash: string
  totalByteLength: number
}

interface SyncAccessHandle {
  close(): void
  getSize(): number
  read(buffer: Uint8Array, options?: { at?: number }): number
  write(buffer: Uint8Array, options?: { at?: number }): number
  truncate(size: number): void
  flush(): void
}

interface LibCache {
  close(): void
  read(uri: string): string | undefined
}

const CACHE_DIRECTORY = 'typescript-lib-cache'
const HEADER_SIZE = 128
const HEADER_MAGIC = 'LVCE-TypeScript-Lib-Cache'
const textDecoder = new TextDecoder()
const textEncoder = new TextEncoder()

const getHeader = (manifest: TypeScriptLibManifest): Uint8Array => {
  const header = textEncoder.encode(`${HEADER_MAGIC}\n${manifest.hash}\n${manifest.totalByteLength}\n`)
  if (header.byteLength > HEADER_SIZE) {
    throw new Error('TypeScript lib cache header is too large')
  }
  const paddedHeader = new Uint8Array(HEADER_SIZE)
  paddedHeader.set(header)
  return paddedHeader
}

const getSha256 = async (content: Uint8Array): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', content.slice().buffer as ArrayBuffer)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const isCacheValid = async (handle: SyncAccessHandle, manifest: TypeScriptLibManifest): Promise<boolean> => {
  if (handle.getSize() !== HEADER_SIZE + manifest.totalByteLength) {
    return false
  }
  const header = new Uint8Array(HEADER_SIZE)
  const bytesRead = handle.read(header, { at: 0 })
  if (bytesRead !== HEADER_SIZE) {
    return false
  }
  const expected = `${HEADER_MAGIC}\n${manifest.hash}\n${manifest.totalByteLength}\n`
  if (textDecoder.decode(header.subarray(0, expected.length)) !== expected) {
    return false
  }
  let offset = HEADER_SIZE
  for (const file of manifest.files) {
    const content = new Uint8Array(file.byteLength)
    const bytesRead = handle.read(content, { at: offset })
    if (bytesRead !== file.byteLength || (await getSha256(content)) !== file.sha256) {
      return false
    }
    offset += file.byteLength
  }
  return true
}

const getFileContents = async (manifest: TypeScriptLibManifest): Promise<Uint8Array[]> => {
  const contents = new Array<Uint8Array>(manifest.files.length)
  let nextIndex = 0
  const fetchNext = async (): Promise<void> => {
    const index = nextIndex++
    if (index >= manifest.files.length) {
      return
    }
    const { fileName, sha256, byteLength } = manifest.files[index]
    const url = GetLibFileUrl.getLibFileUrl(fileName)
    // Request declaration text: the development server otherwise transpiles .ts files.
    const response = await fetch(url, { headers: { Accept: 'text/plain' } })
    if (!response.ok) {
      throw new Error(`Failed to fetch TypeScript lib ${fileName}: ${response.status}`)
    }
    const content = new Uint8Array(await response.arrayBuffer())
    if (content.byteLength !== byteLength) {
      throw new Error(`TypeScript lib size changed during cache population: ${fileName}`)
    }
    const hash = await getSha256(content)
    if (hash !== sha256) {
      throw new Error(`TypeScript lib content changed during cache population: ${fileName}`)
    }
    contents[index] = content
    await fetchNext()
  }
  await Promise.all(Array.from({ length: Math.min(8, manifest.files.length) }, fetchNext))
  return contents
}

const populateCache = async (handle: SyncAccessHandle, manifest: TypeScriptLibManifest): Promise<void> => {
  const contents = await getFileContents(manifest)
  handle.truncate(0)
  let offset = HEADER_SIZE
  try {
    for (const content of contents) {
      const bytesWritten = handle.write(content, { at: offset })
      if (bytesWritten !== content.byteLength) {
        throw new Error('Failed to write complete TypeScript lib cache')
      }
      offset += content.byteLength
    }
    if (offset !== HEADER_SIZE + manifest.totalByteLength) {
      throw new Error('TypeScript lib cache manifest size does not match its files')
    }
    const header = getHeader(manifest)
    const bytesWritten = handle.write(header, { at: 0 })
    if (bytesWritten !== HEADER_SIZE) {
      throw new Error('Failed to publish TypeScript lib cache header')
    }
    handle.flush()
    if (!(await isCacheValid(handle, manifest))) {
      throw new Error('Written TypeScript lib cache failed content verification')
    }
  } catch (error) {
    handle.truncate(0)
    handle.flush()
    throw error
  }
}

const getAccessHandle = async (fileHandle: FileSystemFileHandle, mode: 'read-only' | 'readwrite-unsafe') => {
  // @ts-ignore - createSyncAccessHandle is not in the current DOM typings
  return (await fileHandle.createSyncAccessHandle({ mode })) as SyncAccessHandle
}

const createLibCache = (handle: SyncAccessHandle, manifest: TypeScriptLibManifest): LibCache => {
  const offsets = new Map<string, { offset: number; byteLength: number }>()
  let offset = HEADER_SIZE
  for (const file of manifest.files) {
    offsets.set(file.fileName, { offset, byteLength: file.byteLength })
    offset += file.byteLength
  }
  return {
    close() {
      handle.close()
    },
    read(uri) {
      const fileName = uri.slice(uri.lastIndexOf('/') + 1)
      const entry = offsets.get(fileName)
      if (!entry) {
        return undefined
      }
      const content = new Uint8Array(entry.byteLength)
      const bytesRead = handle.read(content, { at: entry.offset })
      if (bytesRead !== entry.byteLength) {
        return undefined
      }
      return textDecoder.decode(content)
    },
  }
}

const openOrPopulateCache = async (directory: FileSystemDirectoryHandle, manifest: TypeScriptLibManifest) => {
  const cacheFileName = `${manifest.hash}.bin`
  const withLock = async (): Promise<SyncAccessHandle> => {
    let fileHandle: FileSystemFileHandle
    try {
      fileHandle = await directory.getFileHandle(cacheFileName)
      const readHandle = await getAccessHandle(fileHandle, 'read-only')
      let valid = false
      try {
        valid = await isCacheValid(readHandle, manifest)
        if (valid) {
          return readHandle
        }
      } finally {
        if (!valid) {
          readHandle.close()
        }
      }
    } catch {
      fileHandle = await directory.getFileHandle(cacheFileName, { create: true })
    }
    const writeHandle = await getAccessHandle(fileHandle, 'readwrite-unsafe')
    try {
      await populateCache(writeHandle, manifest)
    } catch (error) {
      writeHandle.close()
      throw error
    }
    writeHandle.close()
    return getAccessHandle(fileHandle, 'read-only')
  }

  if (!navigator.locks) {
    throw new Error('Web Locks are unavailable')
  }
  return navigator.locks.request(`typescript-lib-cache-${cacheFileName}`, withLock)
}

export const initialize = async (manifest: TypeScriptLibManifest): Promise<LibCache> => {
  const root = await navigator.storage.getDirectory()
  const directory = await root.getDirectoryHandle(CACHE_DIRECTORY, { create: true })
  const handle = await openOrPopulateCache(directory, manifest)
  return createLibCache(handle, manifest)
}

export const read = (cache: LibCache, uri: string): string | undefined => cache.read(uri)

export const getManifest = (): TypeScriptLibManifest => JSON.parse('__TYPE_SCRIPT_LIB_MANIFEST__')
