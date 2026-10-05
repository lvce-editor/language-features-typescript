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
      ...(item.replacementSpan && {
        replacementRange: {
          endOffset: item.replacementSpan.start + item.replacementSpan.length,
          startOffset: item.replacementSpan.start,
        },
      }),
      snippet: item.name,
      source: 'ts',
    }
  })
}
