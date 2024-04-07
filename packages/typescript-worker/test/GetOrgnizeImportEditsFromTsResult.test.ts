import { expect, test } from '@jest/globals'
import * as GetOrganizeImportEditsFromTsResult from '../src/parts/GetOrganizeImportEditsFromTsResult/GetOrgnizeImportEditsFromTsResult.ts'
import type * as TypeScriptProtocol from '../src/parts/TypeScriptProtocol/TypeScriptProtocol.ts'

test('getEditsFromTsResult', async () => {
  const Position = {
    getOffset() {
      return 0
    },
  }
  const textDocument = {
    uri: '',
  }
  const tsResult: TypeScriptProtocol.OrganizeImportsResponse['body'] = [
    {
      fileName: '/test/index.ts',
      textChanges: [
        {
          start: {
            line: 1,
            offset: 1,
          },
          end: {
            line: 1,
            offset: 1,
          },
          newText: 'abc',
        },
      ],
    },
  ]
  expect(await GetOrganizeImportEditsFromTsResult.getEditsFromTsResult(Position, textDocument, tsResult)).toEqual([
    {
      endOffset: 0,
      inserted: 'abc',
      startOffset: 0,
    },
  ])
})
