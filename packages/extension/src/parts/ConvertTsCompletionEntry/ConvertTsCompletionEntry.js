import * as ConvertCompletionItemKind from '../ConvertCompletionItemKind/ConvertCompletionItemKind.js'

/**
 *
 * @param {import('typescript/lib/protocol').CompletionEntry} tsEntry
 */
export const convertTsCompletionEntry = (tsEntry) => {
  return {
    label: tsEntry.name,
    snippet: tsEntry.name,
    kind: ConvertCompletionItemKind.convertCompletionItemKind(tsEntry.kind),
  }
}
