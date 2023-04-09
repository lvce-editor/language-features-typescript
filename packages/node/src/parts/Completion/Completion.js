import * as NotUsefulEntries from '../NotUsefuleEntries/NotUsefulEntries.js'
import * as Position from '../Position/Position.js'
import * as TsCompletionItemKind from '../TsCompletionItemKind/TsCompletionItemKind.js'
import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'

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
export const getCompletion = async (uri, offset) => {
  const tsPosition = Position.getTsPosition(uri, offset)
  const tsResult = await TsServerRequests.completionInfo({
    file: uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  console.log(JSON.stringify({ tsResult }, null, 2))
  return getCompletionFromTsResult(tsResult)
}
