import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.ts'
export const provideTabCompletion = async (textDocument: any, offset: number): Promise<any> => {
  let start = offset
  while (start > 0 && /[$\p{ID_Continue}]/u.test(textDocument.text[start - 1])) start--
  const prefix = textDocument.text.slice(start, offset)
  if (!prefix) return undefined
  const worker = await TypeScriptWorker.getInstance()
  const items: { label: string; snippet: string }[] = await worker.invoke(
    'Completion.getCompletions',
    textDocument,
    offset,
  )
  const item = items.find((entry) => entry.label.startsWith(prefix))
  return item ? { deleted: prefix.length, inserted: item.snippet, offset: offset - prefix.length, type: 2 } : undefined
}
