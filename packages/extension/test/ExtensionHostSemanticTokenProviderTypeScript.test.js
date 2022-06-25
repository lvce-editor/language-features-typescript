import { getSemanticTokensFromTsResult } from '../src/parts/ExtensionHost/ExtensionHostSemanticTokenProviderTypeScript.js'

test('getSemanticTokensFromTsResult', () => {
  expect(
    getSemanticTokensFromTsResult({
      lines: [],
      uri: '',
    })
  )
})
