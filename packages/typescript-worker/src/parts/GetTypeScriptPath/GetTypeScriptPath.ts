export const getTypeScriptPath = (): string => {
  const tsPath = new URL('../../../node_modules/typescript/lib/typescript-esm.js', import.meta.url).toString()
  return tsPath
}
