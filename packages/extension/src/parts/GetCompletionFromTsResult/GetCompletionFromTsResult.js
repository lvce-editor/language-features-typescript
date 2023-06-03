import * as ConvertCompletionEntry from '../ConvertTsCompletionEntry/ConvertTsCompletionEntry.js'
import * as IsUsefulEntry from '../IsUsefulEntry/IsUsefulEntry.js'

export const languageId = 'typescript'

/**
 * @param {import('typescript/lib/protocol').CompletionInfo} tsResult
 * @returns {vscode.Completion[]}
 */
export const getCompletionFromTsResult = (tsResult) => {
  return tsResult.entries
    .filter(IsUsefulEntry.isUsefulEntry)
    .map(ConvertCompletionEntry.convertTsCompletionEntry)
}
