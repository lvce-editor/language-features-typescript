import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.ts'
import * as TsCompletionItemKind from '../TsCompletionItemKind/TsCompletionItemKind.ts'

const functionKinds: ReadonlySet<string> = new Set([
  TsCompletionItemKind.Function,
  TsCompletionItemKind.LocalFunction,
  TsCompletionItemKind.Method,
])

export const isFunction = (tsResult: TypeScriptProtocol.CompletionEntryDetails) => {
  return functionKinds.has(tsResult.kind)
}
