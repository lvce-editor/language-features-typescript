import * as GetLibFileUrl from '../GetLibFileUrl/GetLibFileUrl.ts'
import * as GetTextSync from '../GetTextSync/GetTextSync.ts'

export const readLibFile = (uri: string): string | undefined => {
  const url = GetLibFileUrl.getLibFileUrl(uri)
  if (!url) {
    return undefined
  }
  return GetTextSync.getTextSync(url)
}
