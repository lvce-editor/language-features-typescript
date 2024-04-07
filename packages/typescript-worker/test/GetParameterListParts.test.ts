import { expect, test } from '@jest/globals'
import * as GetParameterListParts from '../src/parts/GetParameterListParts/GetParameterListParts.ts'
import type * as TypeScriptProtocol from '../src/parts/TypeScriptProtocol/TypeScriptProtocol.ts'

test('getParameterListParts', () => {
  const displayParts: TypeScriptProtocol.SymbolDisplayPart[] = [
    {
      kind: 'methodName',
      text: 'a',
    },
  ]
  expect(GetParameterListParts.getParameterListParts(displayParts)).toEqual([])
})
