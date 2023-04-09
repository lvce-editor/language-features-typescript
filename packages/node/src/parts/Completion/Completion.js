import * as ConvertCompletionEntry from '../ConvertTsCompletionEntry/ConvertTsCompletionEntry.js'
import * as IsUsefulEntry from '../IsUsefulEntry/IsUsefulEntry.js'
import * as Position from '../Position/Position.js'
import * as TextDocuments from '../TextDocuments/TextDocuments.js'
import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'

export const languageId = 'typescript'

/**
 * @param {import('typescript/lib/protocol').CompletionInfo} tsResult
 * @returns {vscode.Completion[]}
 */
const getCompletionFromTsResult = (tsResult) => {
  return tsResult.entries
    .filter(IsUsefulEntry.isUsefulEntry)
    .map(ConvertCompletionEntry.convertTsCompletionEntry)
}
/**
 * @type {vscode.CompletionProvider['provideCompletions']}
 */
export const getCompletion = async (uri, offset) => {
  if (!TextDocuments.hasUri(uri)) {
    throw new Error(`Text document must be opened before requesting completion`)
  }
  const tsPosition = Position.getTsPosition(uri, offset)
  const tsResult = await TsServerRequests.completionInfo({
    file: uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  return getCompletionFromTsResult(tsResult)
}
