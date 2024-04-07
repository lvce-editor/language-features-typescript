import * as TsCompletionItemKind from '../TsCompletionItemKind/TsCompletionItemKind.js'
import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.js'

export const isFunction = (tsResult: TypeScriptProtocol.CompletionEntryDetails) => {
  switch (tsResult.kind) {
    case TsCompletionItemKind.Function:
    case TsCompletionItemKind.LocalFunction:
    case TsCompletionItemKind.Method:
      return true
    default:
      return false
  }
}
