import * as GetLibFileUrl from '../GetLibFileUrl/GetLibFileUrl.ts'
import * as GetTextSync from '../GetTextSync/GetTextSync.ts'
import * as TypeScriptLibCache from '../TypeScriptLibCache/TypeScriptLibCache.ts'

let libCache: Awaited<ReturnType<typeof TypeScriptLibCache.initialize>> | undefined

export const initialize = async (): Promise<void> => {
  try {
    libCache = await TypeScriptLibCache.initialize(TypeScriptLibCache.getManifest())
  } catch {
    // The TypeScript worker can continue to read library files through the existing fallback.
    libCache = undefined
  }
}

export const readLibFile = (uri: string): string | undefined => {
  const url = GetLibFileUrl.getLibFileUrl(uri)
  if (!url) {
    return undefined
  }
  const cached = libCache && TypeScriptLibCache.read(libCache, url)
  if (cached !== undefined) {
    return cached
  }
  return GetTextSync.getTextSync(url)
}
