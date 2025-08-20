/**
 *
 * @param {string} uri
 */
export const isLibFile = (uri: string): boolean => {
  return uri.includes('/node_modules/@typescript')
}
