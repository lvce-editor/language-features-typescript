export const isLibFile = (uri: string): boolean => {
  return uri === 'lib.d.ts' || uri.includes('node_modules/@typescript') || uri.startsWith('lib.')
}
