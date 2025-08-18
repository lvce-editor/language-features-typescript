import type ts from 'typescript'
import * as IsUsefulEntry from '../IsUsefulEntry/IsUsefulEntry.ts'

export const getCompletionFromTsResult2 = (tsResult: ts.CompletionInfo) => {
  if (!tsResult) {
    return []
  }
  return tsResult.entries.filter(IsUsefulEntry.isUsefulEntry).map((item) => {
    return {
      label: item.name,
      snippet: item.name,
      kind: 0,
      source: 'ts',
      flags: 0,
    }
  })
}
