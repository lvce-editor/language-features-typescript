import * as GetTextSync from '../GetTextSync/GetTextSync.js'

export const state = {
  files: Object.create(null),
  version: 1,
}

export const readFile = (uri) => {
  if (uri === '/lib.d.ts') {
    const libUrl = new URL('../../../../extension/node_modules/typescript/lib/lib.d.ts', import.meta.url).toString()
    const text = GetTextSync.getTextSync(libUrl)
    return text
  }
  if (uri.startsWith('/node_modules/@typescript')) {
    const relativePath = uri.replace('-', '.').slice('/node_modules/@typescript'.length, -3) + '.d.ts'
    const libUrl = new URL(`../../../../extension/node_modules/typescript/lib${relativePath}`, import.meta.url).toString()
    const text = GetTextSync.getTextSync(libUrl)
    return text
  }
  return state.files[uri]
}

export const writeFile = (uri, text) => {
  state.files[uri] = text
  state.version++
}

export const getVersion = () => {
  return state.version
}

export const getAllFiles = () => {
  return Object.keys(state.files)
}

export const readVersion = (fileName) => {
  return '1'
}
