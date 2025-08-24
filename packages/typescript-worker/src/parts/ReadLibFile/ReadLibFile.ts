import * as GetTextSync from '../GetTextSync/GetTextSync.ts'
import * as GetLibFileUrl from '../GetLibFileUrl/GetLibFileUrl.ts'

export const readLibFile = (uri: string): string | undefined => {
  const url = GetLibFileUrl.getLibFileUrl(uri)
  if (!url) {
    return undefined
  }
  return GetTextSync.getTextSync(url)
}
