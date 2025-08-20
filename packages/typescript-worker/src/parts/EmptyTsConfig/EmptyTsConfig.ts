import type { ParsedCommandLine } from 'typescript'

export const emptyTsconfig: ParsedCommandLine = {
  options: {},
  errors: [],
  fileNames: [],
}
