// @ts-nocheck
import * as ConvertCompletionEntry from '../ConvertTsCompletionEntry/ConvertTsCompletionEntry.js'
import * as IsUsefulEntry from '../IsUsefulEntry/IsUsefulEntry.js'

/**
 * @param {import('../TsServerProtocol/TsServerProtocol.js').CompletionInfo} tsResult
 * @returns {vscode.Completion[]}
 */
export const getCompletionFromTsResult = (tsResult) => {
  return tsResult.entries.filter(IsUsefulEntry.isUsefulEntry).map(ConvertCompletionEntry.convertTsCompletionEntry)
}
