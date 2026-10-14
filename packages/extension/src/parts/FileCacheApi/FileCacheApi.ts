import { exists, getCacheFileHandle, getFileHashes, readDirWithFileTypes, readFile } from '@lvce-editor/api'
import { toFileUri } from '../ToFileUri/ToFileUri.ts'
import { writeResult } from '../WriteResult/WriteResult.ts'

export const getHandle = (name: string): Promise<FileSystemFileHandle> => getCacheFileHandle(name)

export const getIdentities = async (uris: readonly string[]): Promise<readonly (string | null)[]> => {
  const normalized = uris.map(toFileUri)
  const diskUris = normalized.filter((uri) => uri.startsWith('file://'))
  const diskHashes = diskUris.length > 0 ? await getFileHashes(diskUris) : []
  const byUri = new Map(diskUris.map((uri, index) => [uri, diskHashes[index]] as const))
  const hashes = normalized.map((uri) => byUri.get(uri) || null)
  // The disk hash API accepts only file: URIs. Other providers must validate
  // their contents; this fallback cannot save provider content reads.
  let next = 0
  const hashNext = async (): Promise<void> => {
    while (next < normalized.length) {
      const index = next++
      const uri = normalized[index]
      if (hashes[index] || uri.startsWith('file://')) continue
      try {
        const content = await readFile(uri)
        const bytes = new TextEncoder().encode(content)
        const digest = await crypto.subtle.digest('SHA-256', bytes)
        hashes[index] = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
      } catch {
        hashes[index] = null
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(16, normalized.length) }, hashNext))
  return hashes
}

export const getHashes = async (id: number, uris: readonly string[]): Promise<void> => {
  await writeResult(id, () => getIdentities(uris))
}

export const getValidation = async (
  id: number,
  directories: readonly string[],
  missing: readonly string[],
): Promise<void> => {
  await writeResult(id, async () => {
    const entries: string[][] = Array.from({ length: directories.length })
    const available: boolean[] = Array.from({ length: missing.length })
    let next = 0
    const check = async (): Promise<void> => {
      while (next < directories.length + missing.length) {
        const index = next++
        if (index < directories.length) {
          const contents = await readDirWithFileTypes(toFileUri(directories[index]))
          entries[index] = contents.map((item) => item.name)
        } else {
          const missingIndex = index - directories.length
          available[missingIndex] = await exists(toFileUri(missing[missingIndex]))
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(16, directories.length + missing.length) }, check))
    return { available, entries }
  })
}
