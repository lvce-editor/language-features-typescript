import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.ts'
import * as ConvertCompletionItemKind from '../ConvertCompletionItemKind/ConvertCompletionItemKind.ts'
import * as ConvertTsCompletionKindModifiers from '../ConvertTsCompletionKindModifiers/ConvertTsCompletionKindModifiers.ts'

// TODO don't pass lots of data to renderer worker
// source and data properties are only necessary for resolveCompletionItem

export const convertTsCompletionEntry = (tsEntry: TypeScriptProtocol.CompletionEntry) => {
  const { data, kind, kindModifiers, name, source } = tsEntry
  return {
    data,
    flags: ConvertTsCompletionKindModifiers.convertTsCompletionKindModifiers(kindModifiers || ''),
    kind: ConvertCompletionItemKind.convertCompletionItemKind(kind),
    label: name,
    snippet: name,
    source,
  }
}
