import type { CompilerOptions, ParseConfigHost, ParsedCommandLine } from 'typescript'
import { emptyTsconfig } from '../EmptyTsConfig/EmptyTsConfig.ts'
import { getFiles } from '../GetFiles/GetFiles.ts'
import { getParentPath } from '../GetParentPath/GetParentPath.ts'

export const resolveTsconfig = (
  tsconfigPath: string,
  parsed: any,
  readFile: (uri: string) => string,
  readDir: (uri: string) => readonly string[],
  fileExists: (uri: string) => boolean,
  ts: typeof import('typescript'),
): ParsedCommandLine => {
  if (!tsconfigPath) {
    return emptyTsconfig
  }
  try {
    const rootDir = getParentPath(tsconfigPath)
    // ts.parseJsonConfigFileContent(fileName, jsonText).fileNames
    const host: ParseConfigHost = {
      fileExists,
      readDirectory: readDir,
      readFile,
      useCaseSensitiveFileNames: false,
    }
    const existingOptions = {}
    const config2 = ts.parseJsonConfigFileContent(parsed, host, rootDir, existingOptions, tsconfigPath)
    let options: CompilerOptions = config2.options
    console.log({ config2 })
    options = {
      ...options,
      rootDir,
    }

    const dirname = getParentPath(tsconfigPath)
    const include = options.include || []
    const files = getFiles(dirname, include as string[], readDir)
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
