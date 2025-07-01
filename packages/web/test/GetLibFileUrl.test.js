import * as GetLibFileUrl from '../src/parts/GetLibFileUrl/GetLibFileUrl.js'

test('getLibFileUrl - empty', () => {
  expect(GetLibFileUrl.getLibFileUrl('')).toBe('')
})

test('getLibFileUrl - /lib.d.ts', () => {
  expect(GetLibFileUrl.getLibFileUrl('/lib.d.ts')).toBe(
    new URL('../../extension/node_modules/typescript/lib/lib.d.ts', import.meta.url).toString(),
  )
})

test('getLibFileUrl - /node_modules/@typescript/lib-es5.ts', () => {
  expect(GetLibFileUrl.getLibFileUrl('/node_modules/@typescript/lib-es5.ts')).toBe(
    new URL('../../extension/node_modules/typescript/lib/lib.es5.d.ts', import.meta.url).toString(),
  )
})

test('getLibFileUrl - /node_modules/@typescript/lib-webworker/importscripts.ts', () => {
  expect(GetLibFileUrl.getLibFileUrl('/node_modules/@typescript/lib-webworker/importscripts.ts')).toBe(
    new URL('../../extension/node_modules/typescript/lib/lib.webworker.importscripts.d.ts', import.meta.url).toString(),
  )
})
