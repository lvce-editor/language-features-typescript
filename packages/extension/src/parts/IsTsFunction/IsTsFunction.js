import * as TsCompletionItemKind from '../TsCompletionItemKind/TsCompletionItemKind.js'

/**
 *
 * @param {import('typescript/lib/typescript.js').CompletionEntryDetails} tsResult
 */
export const isFunction = (tsResult) => {
  switch (tsResult.kind) {
    case TsCompletionItemKind.Function:
    case TsCompletionItemKind.LocalFunction:
    case TsCompletionItemKind.Method:
      return true
    default:
      return false
  }
}
