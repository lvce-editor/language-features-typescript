import * as GetTextSync from '../GetTextSync/GetTextSync.js'

export const readLibFile = (uri) => {
  if (uri === '/lib.d.ts') {
    const libUrl = new URL('../../../../extension/node_modules/typescript/lib/lib.d.ts', import.meta.url).toString()
    const text = GetTextSync.getTextSync(libUrl)
    return text
  }
  if (uri.startsWith('/node_modules/@typescript')) {
    const relativePath = uri.replaceAll('-', '.').slice('/node_modules/@typescript'.length, -3) + '.d.ts'
    const libUrl = new URL(`../../../../extension/node_modules/typescript/lib${relativePath}`, import.meta.url).toString()
    const text = GetTextSync.getTextSync(libUrl)
    return text
  }
}
