import { getCacheFileHandle, getFileHashes, readFile } from '@lvce-editor/api'
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
