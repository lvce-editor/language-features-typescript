import type * as TypeScript from 'typescript'

// TypeScript's compiler runtime exports the matcher used by ts.sys.readDirectory.
// The browser worker supplies directory entries over its synchronous transport.
type ConfigTypeScript = typeof TypeScript & {
  matchFiles: (
    path: string,
    extensions: readonly string[] | undefined,
    exclude: readonly string[] | undefined,
    include: readonly string[] | undefined,
    caseSensitive: boolean,
    currentDirectory: string,
    depth: number | undefined,
    entries: (path: string) => { files: readonly string[]; directories: readonly string[] },
    realpath: (path: string) => string,
  ) => string[]
}

export const createReadDirectory =
  (
    ts: typeof TypeScript,
    readDir: (uri: string) => readonly string[],
    currentDirectory: string,
  ): NonNullable<TypeScript.LanguageServiceHost['readDirectory']> =>
  (path, extensions, exclude, include, depth) =>
    (ts as ConfigTypeScript).matchFiles(
      path,
      extensions,
      exclude,
      include,
      true,
      currentDirectory,
      depth,
      (directory) => {
        try {
          const entries = readDir(directory)
          // Name-only transports cannot classify entries. Probing a file as a
          // directory returns no entries; the compiler still filters all names.
          return { files: entries, directories: entries }
        } catch {
          return { files: [], directories: [] }
        }
      },
      (path) => path,
    )
