import * as CompleteFunctionCall from '../CompleteFunctionCall/CompleteFunctionCall.js'
import * as TsCompletionItemKind from '../TsCompletionItemKind/TsCompletionItemKind.js'

/**
 *
 * @param {import('typescript/lib/typescript.js').CompletionEntryDetails} tsResult
 */
const isFunction = (tsResult) => {
  switch (tsResult.kind) {
    case TsCompletionItemKind.Function:
    case TsCompletionItemKind.LocalFunction:
    case TsCompletionItemKind.Method:
      return true
    default:
      return false
  }
}

/**
 *
 * @param {import('typescript/lib/typescript.js').CompletionEntryDetails[]} tsResult
 * @returns
 */
export const getResolveCompletionItemFromTsResult = (tsResult) => {
  if (tsResult.length === 0) {
    return undefined
  }
  const first = tsResult[0]
  if (isFunction(first)) {
    const snippet = CompleteFunctionCall.completeFunctionCall(first.name, first.displayParts)
    return {
      name: first.name,
      snippet,
    }
  }
  return {
    name: first.name,
    snippet: first.name,
  }
}
