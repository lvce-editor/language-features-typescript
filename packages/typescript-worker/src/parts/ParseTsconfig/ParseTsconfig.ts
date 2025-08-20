import type { ParsedCommandLine } from 'typescript'
import { getFiles } from '../GetFiles/GetFiles.ts'
import { getParentPath } from '../GetParentPath/GetParentPath.ts'

const emptyTsconfig: ParsedCommandLine = {
  options: {},
  errors: [],
  fileNames: [],
}

export const parseTsconfig = (
  tsconfigPath: string,
  readFile: (uri: string) => string,
  readDir: (uri: string) => readonly string[],
): ParsedCommandLine => {
  console.log({ tsconfigPath })
  if (!tsconfigPath) {
    return emptyTsconfig
  }
  try {
    const content = readFile(tsconfigPath)
    const parsed = JSON.parse(content)
    const rootDir = getParentPath(tsconfigPath)
    let options = parsed.compilerOptions || {}
    options = {
      ...options,
      target: 99,
      lib: ['lib.esnext.d.ts', 'lib.webworker.d.ts'],
      checkJs: true,
      module: 99,
      types: [],
      moduleResolution: 2,
      rootDir,
      allowJs: true,
      skipLibCheck: true,
      noEmit: true,
      allowSyntheticDefaultImports: true,
      isolatedModules: true,
      assumeChangesOnlyAffectDirectDependencies: true,
      strict: true,
      noImplicitAny: false,
      // composite: true,
      configFilePath: tsconfigPath,
    }

    const dirname = getParentPath(tsconfigPath)
    console.log({ tsconfigPath, dirname })
    const include = options.include || []
    const files = getFiles(dirname, include, readDir)
    console.log({ files })
    const result: ParsedCommandLine = {
      options,
      errors: [],
      fileNames: files as string[],
    }
    return result
  } catch (error) {
    console.log('catch', error)
    return emptyTsconfig
  }
}
