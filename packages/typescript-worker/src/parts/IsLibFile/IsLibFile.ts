/**
 * @param {string} uri
 */
export const isLibFile = (uri: string): boolean => {
  return uri === '/lib.d.ts' || uri.startsWith('/node_modules/@typescript')
}
