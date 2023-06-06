import * as Completion from '../Completion/Completion.js'
import * as GetCompletionFromTsResult from '../GetCompletionFromTsResult/GetCompletionFromTsResult.js'
import * as LanguageId from '../LanguageId/LanguageId.js'

export const languageId = LanguageId.TypeScript

/**
 * @type {vscode.CompletionProvider['provideCompletions']}
 */
export const provideCompletions = async (textDocument, offset) => {
  const tsResult = await Completion.getCompletion(textDocument, offset)
  const items = GetCompletionFromTsResult.getCompletionFromTsResult(tsResult)
  return items
}

// const getCompletionDetailsFromTsResult = (tsResult) => {
//   return undefined
// }

// /**
//  * @type {vscode.CompletionProvider['resolveCompletionItem']}
//  */
// export const resolveCompletionItem = async (textDocument, offset) => {
//   const tsPosition = Position.getTsPosition(textDocument, offset)
//   const tsResult = await TsServerRequests.completionDetails({
//     entryNames: [],
//     file: textDocument.uri,
//     line: tsPosition.line,
//     offset: tsPosition.offset,
//   })
//   return getCompletionDetailsFromTsResult(tsResult)
// }
