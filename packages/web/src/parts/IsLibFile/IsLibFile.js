/**
 * @param {string} uri
 */
export const isLibFile = (uri) => {
  return uri === '/lib.d.ts' || uri.startsWith('/node_modules/@typescript')
}
