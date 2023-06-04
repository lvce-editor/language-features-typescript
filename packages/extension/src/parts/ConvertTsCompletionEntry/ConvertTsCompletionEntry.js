import * as ConvertCompletionItemKind from '../ConvertCompletionItemKind/ConvertCompletionItemKind.js'

/**
 *
 * @param {import('typescript/lib/protocol').CompletionEntry} tsEntry
 */
export const convertTsCompletionEntry = (tsEntry) => {
  const { name, kind } = tsEntry
  return {
    label: name,
    snippet: name,
    kind: ConvertCompletionItemKind.convertCompletionItemKind(kind),
  }
}
