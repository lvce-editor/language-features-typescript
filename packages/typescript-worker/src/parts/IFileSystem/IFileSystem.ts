export interface IFileSystem {
  readonly writeFile: (uri: string, content: string) => void
  readonly readFile: (uri: string) => string
  readonly exists: (uri: string) => boolean
  readonly getVersion: () => string
  readonly getScriptFileNames: () => readonly string[]
  readonly getScriptVersion: (uri: string) => string
}
