import type ts from 'typescript'
import * as IsUsefulEntry from '../IsUsefulEntry/IsUsefulEntry.ts'

export const getCompletionFromTsResult2 = (tsResult: ts.CompletionInfo | undefined) => {
  if (!tsResult) {
    return []
  }
  return tsResult.entries.filter(IsUsefulEntry.isUsefulEntry).map((item) => {
    return {
      flags: 0,
      kind: 0,
      label: item.name,
      snippet: item.name,
      source: 'ts',
    }
  })
}
