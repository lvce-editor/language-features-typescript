export const getTsServerLibraryPath = () => {
  const tsServerLibraryPath = new URL('../../../../extension/node_modules/typescript/lib/tsserverlibrary.js', import.meta.url).toString()
  return tsServerLibraryPath
}
