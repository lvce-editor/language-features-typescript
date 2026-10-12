import type ts from 'typescript'
import * as IsUsefulEntry from '../IsUsefulEntry/IsUsefulEntry.ts'

export const getCompletionFromTsResult2 = (tsResult: ts.CompletionInfo | undefined) => {
  if (!tsResult) {
    return []
  }
  const entries = tsResult.entries.filter(IsUsefulEntry.isUsefulEntry)
  const seen = new Set<string>()
  const uniqueEntries = entries.filter((item) => {
    const key = JSON.stringify([item.name, item.source, item.data])
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
  const nameCounts = new Map<string, number>()
  for (const item of uniqueEntries) {
    nameCounts.set(item.name, (nameCounts.get(item.name) || 0) + 1)
  }
  return uniqueEntries.map((item) => {
    const completionName = item.name
    const sourceDisplay = item.sourceDisplay?.map((part) => part.text).join('') || item.source
    return {
      completionName,
      data: item.data,
      flags: 0,
      kind: 0,
      label: nameCounts.get(item.name)! > 1 && sourceDisplay ? `${item.name} (${sourceDisplay})` : item.name,
      ...(item.replacementSpan && {
        replacementRange: {
          endOffset: item.replacementSpan.start + item.replacementSpan.length,
          startOffset: item.replacementSpan.start,
        },
      }),
      completionSource: item.source,
      snippet: item.name,
      source: 'ts',
    }
  })
}
