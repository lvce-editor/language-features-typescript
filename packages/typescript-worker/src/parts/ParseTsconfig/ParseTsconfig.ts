import type * as TypeScript from 'typescript'

export const parseTsconfig = (tsconfigPath: string, readFile: (uri: string) => string, ts: typeof TypeScript): any => {
  if (!tsconfigPath) {
    return {}
  }
  try {
    const content = readFile(tsconfigPath)
    const { config, error } = ts.parseConfigFileTextToJson(tsconfigPath, content)
    if (error) {
      return {}
    }
    return config
  } catch {
    return {}
  }
}
