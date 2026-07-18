import type ts from 'typescript'
import { expect, test } from '@jest/globals'
import { getCodeActionsFromTsResult } from '../src/parts/GetCodeActionsFromTsResult/GetCodeActionsFromTsResult.ts'

test('getCodeActionsFromTsResult converts TypeScript spelling fixes', () => {
  const fixes: readonly ts.CodeFixAction[] = [
    {
      changes: [
        {
          fileName: '/workspace/src/test.ts',
          textChanges: [
            {
              newText: 'abort',
              span: {
                length: 5,
                start: 23,
              },
            },
          ],
        },
      ],
      description: "Change spelling to 'abort'",
      fixAllDescription: undefined,
      fixId: undefined,
      fixName: 'spelling',
    },
  ]

  expect(getCodeActionsFromTsResult('/workspace/src/test.ts', fixes)).toEqual([
    {
      edits: [
        {
          endOffset: 28,
          inserted: 'abort',
          startOffset: 23,
        },
      ],
      kind: 'quickfix',
      name: "Change spelling to 'abort'",
    },
  ])
})

test('getCodeActionsFromTsResult ignores edits for other files', () => {
  const fixes: readonly ts.CodeFixAction[] = [
    {
      changes: [
        {
          fileName: '/workspace/src/other.ts',
          textChanges: [],
        },
      ],
      description: 'Update other file',
      fixAllDescription: undefined,
      fixId: undefined,
      fixName: 'update',
    },
  ]

  expect(getCodeActionsFromTsResult('/workspace/src/test.ts', fixes)).toEqual([])
})
