export const getLibFileUrl = (uri) => {
  if (uri === 'lib.d.ts' || uri === '/lib.d.ts') {
    return new URL('../../../node_modules/typescript/lib/lib.d.ts', import.meta.url).toString()
  }
  if (uri.startsWith('node_modules/@typescript/lib')) {
    const relativePath =
      uri.slice('node_modules/@typescript/lib'.length, -3).replaceAll('-', '.').replaceAll('/', '.') + '.d.ts'
    return new URL(`../../../node_modules/typescript/lib/lib${relativePath}`, import.meta.url).toString()
  }
  if (uri.startsWith('/node_modules/@typescript/lib')) {
    const relativePath =
      uri.slice('/node_modules/@typescript/lib'.length, -3).replaceAll('-', '.').replaceAll('/', '.') + '.d.ts'
    return new URL(`../../../node_modules/typescript/lib/lib${relativePath}`, import.meta.url).toString()
  }
  return ''
}
