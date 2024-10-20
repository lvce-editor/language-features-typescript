import * as GetTextSync from '../GetTextSync/GetTextSync.ts'
import * as TypeScriptUrl from '../TypeScriptUrl/TypeScriptUrl.ts'

const files = Object.create(null)

let version = 0

export const getVersion = () => {
  return version
}

export const getAllFiles = () => {
  return Object.keys(files)
}
export const writeFile = (path: string, content: string) => {
  version++
  const existing = files[path]
  if (existing) {
    existing.text = content
    existing.version++
  } else {
    files[path] = {
      text: content,
      version: 0,
    }
  }
}

export const readFile = (path: string) => {
  const file = files[path]
  if (!file) {
    if (path.startsWith('/lib')) {
      path = `${TypeScriptUrl.typescriptBaseUrl}/lib${path}`
      const text = GetTextSync.getTextSync(path) // typescript only supports synchronous file system
      return text
    }
    console.info(`[info] file ${path} not found`)
    return ''
  }
  return file.text
}

export const readVersion = (path: string) => {
  const file = files[path]
  if (!file) {
    return '0'
  }
  return file.version
}

export const exists = (path: string) => {
  return path in files
}
