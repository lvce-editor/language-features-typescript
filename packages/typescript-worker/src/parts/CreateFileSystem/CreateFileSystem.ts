import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'

export const createFileSystem = (): IFileSystem => {
  const files: Record<string, string> = Object.create(null)
  const fileSystem: IFileSystem = {
    writeFile(uri, content) {
      files[uri] = content
    },
    readFile(uri) {
      return files[uri]
    },
    getVersion() {
      return '0'
    },
    getScriptFileNames() {
      return Object.keys(files)
    },
    getScriptVersion(uri) {
      return '0'
    },
    exists(uri) {
      return true
    },
  }
  return fileSystem
}
