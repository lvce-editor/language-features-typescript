const libString = 'node_modules/@typescript/lib'
const libStringLength = libString.length

export const getLibFileUrl = (uri: string): string => {
  if (uri === 'lib.d.ts' || uri === '/lib.d.ts') {
    return new URL('../../../node_modules/typescript/lib/lib.d.ts', import.meta.url).toString()
  }
  if (uri.startsWith('lib.')) {
    return new URL(`../../../node_modules/typescript/lib/${uri}`, import.meta.url).toString()
  }
  const index = uri.indexOf(libString)
  if (index === -1) {
    return ''
  }
  const relativePath =
    'lib' +
    uri
      .slice(index + libStringLength)
      .replaceAll('-', '.')
      .replaceAll('/', '.')
      .replaceAll('.ts', '') +
    '.d.ts'

  console.log({ relativePath })
  return new URL(`../../../node_modules/typescript/lib/${relativePath}`, import.meta.url).toString()
}
