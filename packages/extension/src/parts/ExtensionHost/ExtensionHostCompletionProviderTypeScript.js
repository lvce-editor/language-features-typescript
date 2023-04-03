import * as NotUsefulEntries from '../NotUsefuleEntries/NotUsefulEntries.js'
import * as Position from '../Position/Position.js'
import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'

export const languageId = 'typescript'

/**
 *
 * @param {import('typescript/lib/protocol').ScriptElementKind} tsKind
 * @returns
 */
const convertCompletionItemKind = (tsKind) => {
  switch (tsKind) {
    case 'function':
      return /* Function */ 3
    case 'var':
      return /* Variable */ 4
    case 'keyword':
      return /* Keyword */ 5
    case 'directory':
      return /* Folder */ 6
    case 'script':
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
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const tsResult = await TsServerRequests.completionInfo({
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  console.log(JSON.stringify({ tsResult }, null, 2))
  return getCompletionFromTsResult(tsResult)
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
