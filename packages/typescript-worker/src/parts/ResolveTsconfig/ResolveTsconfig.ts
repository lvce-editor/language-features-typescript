import type * as TypeScript from 'typescript'
import { createReadDirectory } from '../CreateReadDirectory/CreateReadDirectory.ts'
import { emptyTsconfig } from '../EmptyTsConfig/EmptyTsConfig.ts'
import { getParentPath } from '../GetParentPath/GetParentPath.ts'

export const resolveTsconfig = (
  tsconfigPath: string,
  parsed: any,
  readFile: (uri: string) => string,
  readDir: (uri: string) => readonly string[],
  fileExists: (uri: string) => boolean,
  ts: typeof TypeScript,
): TypeScript.ParsedCommandLine => {
  if (!tsconfigPath) return emptyTsconfig
  const rootDir = getParentPath(tsconfigPath)
  const host: TypeScript.ParseConfigHost = {
    fileExists,
    readDirectory: createReadDirectory(ts, readDir, rootDir),
    readFile,
    useCaseSensitiveFileNames: true,
  }
  return ts.parseJsonConfigFileContent(parsed, host, rootDir, undefined, tsconfigPath)
}
