import * as ConvertCompletionItemKind from '../ConvertCompletionItemKind/ConvertCompletionItemKind.js'
import * as ConvertTsCompletionKindModifiers from '../ConvertTsCompletionKindModifiers/ConvertTsCompletionKindModifiers.js'

// TODO don't pass lots of data to renderer worker
// source and data properties are only necessary for resolveCompletionItem

/**
 *
 * @param {import('../TsServerProtocol/TsServerProtocol.js').CompletionEntry} tsEntry
 */
export const convertTsCompletionEntry = (tsEntry) => {
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
