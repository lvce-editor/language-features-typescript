import { expect, test } from '@jest/globals'
import { getDocumentSymbolsFromTsResult } from '../src/parts/GetDocumentSymbolsFromTsResult/GetDocumentSymbolsFromTsResult.ts'

test('converts nested navigation items and preserves full and selection ranges', () => {
  const tree = {
    childItems: [
      {
        childItems: [
          {
            kind: 'method',
            nameSpan: { length: 6, start: 42 },
            spans: [{ length: 20, start: 40 }],
            text: 'render',
          },
        ],
        kind: 'class',
        nameSpan: { length: 3, start: 6 },
        spans: [{ length: 100, start: 0 }],
        text: 'App',
      },
    ],
    kind: 'module',
    spans: [{ length: 200, start: 0 }],
    text: '"file"',
  }

  expect(getDocumentSymbolsFromTsResult(tree)).toEqual([
    {
      children: [
        {
          endOffset: 60,
          kind: 'method',
          name: 'render',
          selectionEndOffset: 48,
          selectionStartOffset: 42,
          startOffset: 40,
        },
      ],
      endOffset: 100,
      kind: 'class',
      name: 'App',
      selectionEndOffset: 9,
      selectionStartOffset: 6,
      startOffset: 0,
    },
  ])
})

test('uses the full span when a name span is missing', () => {
  expect(
    getDocumentSymbolsFromTsResult({
      childItems: [
        {
          kind: 'const',
          spans: [{ length: 5, start: 10 }],
          text: 'value',
        },
      ],
      kind: 'module',
      spans: [],
      text: '"file"',
    }),
  ).toEqual([
    {
      endOffset: 15,
      kind: 'const',
      name: 'value',
      selectionEndOffset: 15,
      selectionStartOffset: 10,
      startOffset: 10,
    },
  ])
})

test('omits the navigation tree root and items without spans', () => {
  expect(
    getDocumentSymbolsFromTsResult({
      childItems: [
        {
          kind: 'alias',
          spans: [],
          text: 'missing',
        },
      ],
      kind: 'module',
      spans: [{ length: 10, start: 0 }],
      text: '"file"',
    }),
  ).toEqual([])
})

test('returns no symbols when the navigation tree has no children', () => {
  expect(
    getDocumentSymbolsFromTsResult({
      kind: 'module',
      spans: [{ length: 0, start: 0 }],
      text: '"file"',
    }),
  ).toEqual([])
})
