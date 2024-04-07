import * as CompleteFunctionCall from '../CompleteFunctionCall/CompleteFunctionCall.ts'
import * as IsTsFunction from '../IsTsFunction/IsTsFunction.ts'
import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.ts'

export const getResolveCompletionItemFromTsResult = (
  tsResult: readonly TypeScriptProtocol.CompletionEntryDetails[],
) => {
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
