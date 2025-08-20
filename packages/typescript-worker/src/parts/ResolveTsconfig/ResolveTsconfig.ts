import type { CompilerOptions, ParseConfigHost, ParsedCommandLine } from 'typescript'
import { getFiles } from '../GetFiles/GetFiles.ts'
import { getParentPath } from '../GetParentPath/GetParentPath.ts'
import { emptyTsconfig } from '../EmptyTsConfig/EmptyTsConfig.ts'
import ts from 'typescript'

const parseLib = (config: any): readonly string[] => {
  if (!config.lib) {
    return []
  }
}

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
    console.log({ config2 })
    const { config } = ts.parseConfigFileTextToJson(tsconfigPath, JSON.stringify(parsed))
    console.log({ config })
    let options: CompilerOptions = config2.options
    options = {
      ...options,
      rootDir,
      // configFilePath: undefined,
      // target: 99,
      // lib: ['lib.dom.d.ts'],
      // checkJs: true,
      // module: 99,
      // types: [],
      // moduleResolution: 2,
      // rootDir,
      // allowJs: true,
      // skipLibCheck: true,
      // noEmit: true,
      // allowSyntheticDefaultImports: true,
      // isolatedModules: true,
      // assumeChangesOnlyAffectDirectDependencies: true,
      // strict: true,
      // noImplicitAny: false,
      // composite: true,
      // configFilePath: tsconfigPath,
      // lib: undefined,
      // types: undefined,
      // target: ts.ScriptTarget.ESNext,
      // jsx: ts.JsxEmit.Preserve,
      // moduleResolution: ts.ModuleResolutionKind.NodeNext,
      // allowImportingTsExtensions: true,
    }
    // console.log({default:ts.def})

    const dirname = getParentPath(tsconfigPath)
    const include = options.include || []
    const files = getFiles(dirname, include as string[], readDir)
    console.log({ files })
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
