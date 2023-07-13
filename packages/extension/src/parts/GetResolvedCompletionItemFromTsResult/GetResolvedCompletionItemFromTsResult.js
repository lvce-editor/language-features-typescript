import * as CompleteFunctionCall from '../CompleteFunctionCall/CompleteFunctionCall.js'
import * as IsTsFunction from '../IsTsFunction/IsTsFunction.js'

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
  if (IsTsFunction.isFunction(first)) {
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
