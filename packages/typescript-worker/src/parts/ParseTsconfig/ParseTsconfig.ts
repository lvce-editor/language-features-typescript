export const parseTsconfig = (tsconfigPath: string, readFile: (uri: string) => string): any => {
  if (!tsconfigPath) {
    return {}
  }
  try {
    const content = readFile(tsconfigPath)
    const parsed = JSON.parse(content)
    return parsed
  } catch (error) {
    return {}
  }
}
