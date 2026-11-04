import { expect, test } from '@jest/globals'
import { normalizeFileMapPaths } from '../src/normalizeFileMapPaths.ts'

test('static fixtures use URL paths on Windows, including nested dependency declarations', () => {
  expect(
    normalizeFileMapPaths({
      'main.ts': 'main',
      'node_modules\\example\\index.d.ts': 'declarations',
      'src\\nested\\file.ts': 'source',
    }),
  ).toEqual({
    'main.ts': 'main',
    'node_modules/example/index.d.ts': 'declarations',
    'src/nested/file.ts': 'source',
  })
})

test('existing URL paths and file contents are preserved', () => {
  const files = { 'src/main.ts': 'const escaped = "\\\\"', 'tsconfig.json': '{}' }
  expect(normalizeFileMapPaths(files)).toEqual(files)
})
