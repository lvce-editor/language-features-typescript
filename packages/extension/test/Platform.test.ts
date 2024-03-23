import * as Platform from '../src/parts/Platform/Platform.js'

test('getTsServerPath', () => {
  expect(Platform.getDefaultTsServerPath()).toEqual(expect.any(String))
})
