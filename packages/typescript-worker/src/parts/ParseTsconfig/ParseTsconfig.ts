import type { ParsedCommandLine } from 'typescript'

const emptyTsconfig: ParsedCommandLine = {
  options: {},
  errors: [],
  fileNames: [],
}

export const parseTsconfig = (tsconfigPath: string, readFile: (uri: string) => string): ParsedCommandLine => {
  if (!tsconfigPath) {
    return emptyTsconfig
  }
  const content = readFile(tsconfigPath)
  const parsed = JSON.parse(content)
  const options = parsed.compilerOptions || {}
  const result: ParsedCommandLine = {
    options,
    errors: [],
    fileNames: [],
  }
  return result
}
