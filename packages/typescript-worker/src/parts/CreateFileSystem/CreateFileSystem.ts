export interface IFileSystem {
  readonly writeFile: (uri: string, content: string) => void
  readonly readFile: (uri: string) => string
  readonly getVersion: () => string
  readonly getScriptFileNames: () => readonly string[]
  readonly getScriptVersion: (uri: string) => string
}

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
  }
  return fileSystem
}
