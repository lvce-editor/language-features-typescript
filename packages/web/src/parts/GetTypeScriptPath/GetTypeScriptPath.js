export const getTypeScriptPath = () => {
  const tsPath = new URL('../../../../extension/node_modules/typescript/lib/typescript-esm.js', import.meta.url).toString()
  return tsPath
}
