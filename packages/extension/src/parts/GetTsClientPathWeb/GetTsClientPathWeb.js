export const getTsClientPathWeb = (path) => {
  const tsPath = new URL('../../../node_modules/typescript/lib/typescript.js', import.meta.url).toString()
  return tsPath
}
