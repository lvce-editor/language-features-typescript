import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'

export const createFileSystem = (): IFileSystem => {
  const files: Record<string, string> = Object.create(null)
  const versions: Record<string, number> = Object.create(null)
  let version = 0
  const fileSystem: IFileSystem = {
    getScriptFileNames() {
      return Object.keys(files)
    },
    getScriptVersion(uri) {
      return (versions[uri] || 0).toString()
    },
    getVersion() {
      return version.toString()
    },
    readFile(uri) {
      return files[uri]
    },
    writeFile(uri, content) {
      if (files[uri] === content) {
        return
      }
      files[uri] = content
      versions[uri] = (versions[uri] || 0) + 1
      version++
    },
  }
  return fileSystem
}
