import type * as TypeScript from 'typescript'
import { emptyTsconfig } from '../EmptyTsConfig/EmptyTsConfig.ts'
import { getFiles } from '../GetFiles/GetFiles.ts'
import { getParentPath } from '../GetParentPath/GetParentPath.ts'

export const resolveTsconfig = (
  tsconfigPath: string,
  parsed: any,
  readFile: (uri: string) => string,
  readDir: (uri: string) => readonly string[],
  fileExists: (uri: string) => boolean,
  ts: typeof TypeScript,
): TypeScript.ParsedCommandLine => {
  if (!tsconfigPath) {
    return emptyTsconfig
  }
  try {
    const rootDir = getParentPath(tsconfigPath)
    // ts.parseJsonConfigFileContent(fileName, jsonText).fileNames
    const host: TypeScript.ParseConfigHost = {
      fileExists,
      readDirectory: readDir,
      readFile,
      useCaseSensitiveFileNames: false,
    }
    const existingOptions = emptyTsconfig.options
    const config2 = ts.parseJsonConfigFileContent(parsed, host, rootDir, existingOptions, tsconfigPath)
    let { options } = config2
    options = {
      ...options,
      rootDir,
    }

    const dirname = getParentPath(tsconfigPath)
    const include = parsed.files && !parsed.include ? [] : parsed.include
    const discoveredFiles = getFiles(dirname, include, readDir)
    const configuredFiles = (parsed.files || []).map((file: string) => `${dirname}/${file}`)
    const files = [...new Set([...configuredFiles, ...discoveredFiles])]
    const result: TypeScript.ParsedCommandLine = {
      errors: [],
      fileNames: files as string[],
      options,
    }
    return result
  } catch {
    return emptyTsconfig
  }
}
