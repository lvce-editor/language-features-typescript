import type { ParsedCommandLine } from 'typescript'

export const emptyTsconfig: ParsedCommandLine = {
  errors: [],
  fileNames: [],
  options: {
    allowJs: true,
    checkJs: true,
  },
}
