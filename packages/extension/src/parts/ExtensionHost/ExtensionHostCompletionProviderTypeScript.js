import * as Assert from '../Assert/Assert.js'
import * as GetCompletionFromTsResult from '../GetCompletionFromTsResult/GetCompletionFromTsResult.js'
import * as Rpc from '../Rpc/Rpc.js'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.js'
import * as Position from '../Position/Position.js'

export const languageId = 'typescript'

/**
 * @type {vscode.CompletionProvider['provideCompletions']}
 */
export const provideCompletions = async (textDocument, offset) => {
  const uri = textDocument.uri
  Assert.string(uri)
  await TextDocumentSync.openTextDocuments([textDocument])
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const tsResult = await Rpc.invoke('Completion.getCompletion', {
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
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
