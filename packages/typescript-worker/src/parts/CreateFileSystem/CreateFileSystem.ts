export interface IFileSystem {
  readonly writeFile: (uri: string, content: string) => void
  readonly readFile: (uri: string) => string
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
  }
  return fileSystem
}
