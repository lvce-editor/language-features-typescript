// import * as Definition from '../src/parts/Definition/Definition.js'
import { jest } from '@jest/globals'

jest.unstable_mockModule('../src/parts/TextDocumentSync/TextDocumentSync', () => {
  return {
    openTextDocuments: jest.fn(),
  }
})
jest.unstable_mockModule('../src/parts/Rpc/Rpc', () => {
  return {
    invoke: jest.fn(),
  }
})

const Selection = await import('../src/parts/Selection/Selection.js')
const Rpc = await import('../src/parts/Rpc/Rpc.js')

test('expandSelection', async () => {
  const textDocument = {}
  const positions = [0, 0]
  // @ts-ignore
  Rpc.invoke.mockImplementation(() => {
    return {
      textSpan: {
        start: {
          line: 9,
          offset: 9,
        },
        end: {
          line: 9,
          offset: 12,
        },
      },
    }
  })
  expect(await Selection.expandSelection(textDocument, positions)).toEqual({
    textSpan: {
      start: {
        line: 9,
        offset: 9,
      },
      end: {
        line: 9,
        offset: 12,
      },
    },
  })
})
