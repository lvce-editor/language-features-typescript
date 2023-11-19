import * as GetTextSync from '../GetTextSync/GetTextSync.js'
import * as GetLibFileUrl from '../GetLibFileUrl/GetLibFileUrl.js'

export const readLibFile = (uri) => {
  const url = GetLibFileUrl.getLibFileUrl(uri)
  if (!url) {
    return undefined
  }
  return GetTextSync.getTextSync(uri)
}
