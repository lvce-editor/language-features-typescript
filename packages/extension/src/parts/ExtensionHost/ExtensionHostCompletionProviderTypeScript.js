import * as TsServerRequests from 'ts-server-requests'
import * as Position from '../Position/Position.js'
import * as TsPrimaryServer from '../TsPrimaryServer/TsPrimaryServer.js'
import * as ExtensionHostCompletionItemKind from '../ExtensionHostCompletionItemKind/ExtensionHostCompletionItemKind.js'
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
      return ExtensionHostCompletionItemKind.Function
    case TsCompletionItemKind.Var:
      return ExtensionHostCompletionItemKind.Variable
    case TsCompletionItemKind.Keyword:
      return ExtensionHostCompletionItemKind.Keyword
    case TsCompletionItemKind.Directory:
      return ExtensionHostCompletionItemKind.Folder
    case TsCompletionItemKind.Script:
      return ExtensionHostCompletionItemKind.File
    default:
      return ExtensionHostCompletionItemKind.Unknown
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
 * @param {import('typescript/lib/protocol').CompletionInfo} tsResult
 * @returns {vscode.Completion[]}
 */
const getCompletionFromTsResult = (tsResult) => {
  return tsResult.entries.map(convertTsCompletionEntry)
}
/**
 * @type {vscode.CompletionProvider['provideCompletions']}
 */
export const provideCompletions = async (textDocument, offset) => {
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const server = TsPrimaryServer.getInstance()
  const tsResult = await TsServerRequests.completionInfo(server, {
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
