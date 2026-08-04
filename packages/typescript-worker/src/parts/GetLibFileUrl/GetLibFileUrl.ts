const libString = 'node_modules/@typescript/lib'
const libStringLength = libString.length

export const getLibFileUrl = (uri: string): string => {
  if (uri === 'lib.d.ts' || uri === '/lib.d.ts') {
    return new URL('../../../node_modules/typescript/lib/lib.d.ts', import.meta.url).href
  }
  if (uri.startsWith('lib.')) {
    return new URL(`../../../node_modules/typescript/lib/${uri}`, import.meta.url).href
  }
  const index = uri.indexOf(libString)
  if (index === -1) {
    return ''
  }
  const relativePath =
    'lib' +
    uri
      .slice(index + libStringLength)
      .replaceAll(/[-/]/g, '.')
      .replace(/(?:\.d)?\.ts$/, '') +
    '.d.ts'

  return new URL(`../../../node_modules/typescript/lib/${relativePath}`, import.meta.url).href
}
