// @ts-nocheck
import * as IsUsefulEntry from '../IsUsefulEntry/IsUsefulEntry.js'

const getFirstMatchingEntry = (entries, word) => {
  for (const entry of entries) {
    if (entry.name.startsWith(word)) {
      return entry
    }
  }
  return undefined
}

/**
 * @param {import('typescript/lib/protocol').CompletionInfo} tsResult
 * @returns {vscode.Completion}
 */
export const getTabCompletionFromTsResult = (tsResult, offset, word) => {
  const usefulEntries = tsResult.entries.filter(IsUsefulEntry.isUsefulEntry)
  const firstEntry = getFirstMatchingEntry(usefulEntries, word)
  const text = firstEntry.name
  return {
    offset: offset - word.length,
    inserted: text,
    deleted: word.length,
    type: /* Snippet */ 2,
  }
}
