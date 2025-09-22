import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.ts'
import * as ConvertCompletionItemKind from '../ConvertCompletionItemKind/ConvertCompletionItemKind.ts'
import * as ConvertTsCompletionKindModifiers from '../ConvertTsCompletionKindModifiers/ConvertTsCompletionKindModifiers.ts'

// TODO don't pass lots of data to renderer worker
// source and data properties are only necessary for resolveCompletionItem

export const convertTsCompletionEntry = (tsEntry: TypeScriptProtocol.CompletionEntry) => {
  const { name, kind, source, data, kindModifiers } = tsEntry
  return {
    label: name,
    snippet: name,
    kind: ConvertCompletionItemKind.convertCompletionItemKind(kind),
    source,
    data,
    flags: ConvertTsCompletionKindModifiers.convertTsCompletionKindModifiers(kindModifiers),
  }
}
