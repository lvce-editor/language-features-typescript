import * as GetLibFileUrl from '../GetLibFileUrl/GetLibFileUrl.ts'
import * as GetTextSync from '../GetTextSync/GetTextSync.ts'
import * as TypeScriptLibCache from '../TypeScriptLibCache/TypeScriptLibCache.ts'

let initializationStarted = false
let libCache: Awaited<ReturnType<typeof TypeScriptLibCache.initialize>> | undefined

export const initialize = async (): Promise<void> => {
  initializationStarted = true
  libCache?.close()
  libCache = undefined
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
  if (!initializationStarted) {
    void initialize()
  }
  try {
    const cached = libCache && TypeScriptLibCache.read(libCache, url)
    if (cached !== undefined) {
      return cached
    }
  } catch {
    // An evicted or unavailable cache must not prevent library reads.
    libCache?.close()
    libCache = undefined
  }
  return GetTextSync.getTextSync(url)
}
