export const getTsClientPathWeb = (path) => {
  const tsPath = new URL('../../../../web/src/webMain.js', import.meta.url).toString()
  return tsPath
}
