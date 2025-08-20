import type { ParsedCommandLine } from 'typescript'
import { getFiles } from '../GetFiles/GetFiles.ts'
import { getParentPath } from '../GetParentPath/GetParentPath.ts'
import { emptyTsconfig } from '../EmptyTsConfig/EmptyTsConfig.ts'

export const resolveTsconfig = (
  tsconfigPath: string,
  parsed: any,
  readFile: (uri: string) => string,
  readDir: (uri: string) => readonly string[],
): ParsedCommandLine => {
  if (!tsconfigPath) {
    return emptyTsconfig
  }
  try {
    const rootDir = getParentPath(tsconfigPath)
    let options = parsed.compilerOptions || {}
    options = {
      ...options,
      rootDir,
      configFilePath: tsconfigPath,
    }

    const dirname = getParentPath(tsconfigPath)
    const include = options.include || []
    const files = getFiles(dirname, include, readDir)
    const result: ParsedCommandLine = {
      options,
      errors: [],
      fileNames: files as string[],
    }
    return result
  } catch (error) {
    return emptyTsconfig
  }
}
