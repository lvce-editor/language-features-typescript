import type ts from 'typescript'
import { expect, test } from '@jest/globals'
import { getRenameResultFromTsResult2 } from '../src/parts/GetRenameFromTsResult2/GetRenameFromTsResult2.ts'

test('rejects rename results that TypeScript marks as unavailable', async () => {
  await expect(
    getRenameResultFromTsResult2('', { canRename: false } as ts.RenameInfo, [], 'nextName'),
  ).rejects.toThrow('rename was not successful')
})

test('returns an empty set of workspace edits for a valid rename with no locations', async () => {
  await expect(
    getRenameResultFromTsResult2('', { canRename: true } as ts.RenameInfo, [], 'nextName'),
  ).resolves.toEqual({ canRename: true, edits: [] })
})
