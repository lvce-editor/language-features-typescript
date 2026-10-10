export interface IFileSystem {
  readonly getScriptFileNames: () => readonly string[]
  readonly getScriptVersion: (uri: string) => string
  readonly getVersion: () => string
  readonly readFile: (uri: string) => string | undefined
  readonly releaseFile?: (uri: string) => boolean
  readonly writeFile: (uri: string, content: string) => void
}
