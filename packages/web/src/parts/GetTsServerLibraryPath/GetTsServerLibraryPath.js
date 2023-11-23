export const getTsServerLibraryPath = () => {
  const tsServerLibraryPath = new URL('../../../../extension/node_modules/typescript/lib/typescript.js', import.meta.url).toString()
  return tsServerLibraryPath
}
