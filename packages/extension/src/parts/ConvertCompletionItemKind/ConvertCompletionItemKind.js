import * as TsCompletionItemKind from '../TsCompletionItemKind/TsCompletionItemKind.js'

/**
 *
 * @param {import('typescript/lib/protocol').ScriptElementKind} tsKind
 * @returns
 */
export const convertCompletionItemKind = (tsKind) => {
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
