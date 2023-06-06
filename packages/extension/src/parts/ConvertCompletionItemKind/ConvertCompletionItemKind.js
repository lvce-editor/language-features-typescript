import * as TsCompletionItemKind from '../TsCompletionItemKind/TsCompletionItemKind.js'
import * as CompletionItemKind from '../CompletionKind/CompletionKind.js'

/**
 *
 * @param {import('typescript/lib/protocol').ScriptElementKind} tsKind
 * @returns
 */
export const convertCompletionItemKind = (tsKind) => {
  switch (tsKind) {
    case TsCompletionItemKind.Function:
    case TsCompletionItemKind.Method:
      return CompletionItemKind.Function
    case TsCompletionItemKind.Var:
    case TsCompletionItemKind.Const:
    case TsCompletionItemKind.Let:
      return CompletionItemKind.Variable
    case TsCompletionItemKind.Keyword:
      return CompletionItemKind.Keyword
    case TsCompletionItemKind.Directory:
      return CompletionItemKind.Folder
    case TsCompletionItemKind.Script:
      return CompletionItemKind.File
    case TsCompletionItemKind.Property:
      return CompletionItemKind.Field
    default:
      return CompletionItemKind.Unknown
  }
}
