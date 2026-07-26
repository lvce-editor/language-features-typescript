import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'

export const createFileSystem = (): IFileSystem => {
  const files: Record<string, string> = Object.create(null)
  const fileSystem: IFileSystem = {
    getScriptFileNames() {
      return Object.keys(files)
    },
    getScriptVersion(uri) {
      return '0'
    },
    getVersion() {
      return '0'
    },
    readFile(uri) {
      return files[uri]
    },
    writeFile(uri, content) {
      files[uri] = content
    },
  }
  return fileSystem
}
