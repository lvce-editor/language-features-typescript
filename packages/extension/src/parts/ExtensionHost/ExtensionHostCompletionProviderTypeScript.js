import * as NotUsefulEntries from '../NotUsefuleEntries/NotUsefulEntries.js'
import * as Rpc from '../Rpc/Rpc.js'
import * as TsCompletionItemKind from '../TsCompletionItemKind/TsCompletionItemKind.js'

export const languageId = 'typescript'

/**
 *
 * @param {import('typescript/lib/protocol').ScriptElementKind} tsKind
 * @returns
 */
const convertCompletionItemKind = (tsKind) => {
  switch (tsKind) {
    case TsCompletionItemKind.Function:
      return /* Function */ 3
    case TsCompletionItemKind.Var:
      return /* Variable */ 4
    case TsCompletionItemKind.Keyword:
      return /* Keyword */ 5
    case TsCompletionItemKind.Directory:
      return /* Folder */ 6
    case TsCompletionItemKind.Script:
      return /* File */ 7
    default:
      return /* Unknown */ 0
  }
}

/**
 *
 * @param {import('typescript/lib/protocol').CompletionEntry} tsEntry
 */
const convertTsCompletionEntry = (tsEntry) => {
  return {
    label: tsEntry.name,
    snippet: tsEntry.name,
    kind: convertCompletionItemKind(tsEntry.kind),
  }
}

/**
 *
 * @param {import('typescript/lib/protocol').CompletionEntry} tsEntry
 */
const isUsefulEntry = (tsEntry) => {
  return !NotUsefulEntries.notUsefulEntries.has(tsEntry.name)
}

/**
 * @param {import('typescript/lib/protocol').CompletionInfo} tsResult
 * @returns {vscode.Completion[]}
 */
const getCompletionFromTsResult = (tsResult) => {
  return tsResult.entries.filter(isUsefulEntry).map(convertTsCompletionEntry)
}
/**
 * @type {vscode.CompletionProvider['provideCompletions']}
 */
export const provideCompletions = async (textDocument, offset) => {
  const items = await Rpc.invoke(
    'Completion.getCompletion',
    textDocument.uri,
    offset
  )
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
