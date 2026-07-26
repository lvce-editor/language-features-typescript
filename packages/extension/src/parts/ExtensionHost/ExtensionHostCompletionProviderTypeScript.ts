import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.ts'

interface TextDocument {
  languageId: string
  text: string
  uri: string
  version: number
}

interface CompletionItem {
  additionalTextEdits?: any[]
  command?: any
  commitCharacters?: string[]
  detail?: string
  documentation?: string
  filterText?: string
  insertText?: string
  insertTextFormat?: number
  kind?: number
  label: string
  preselect?: boolean
  range?: any
  sortText?: string
}

export const provideCompletions = async (textDocument: TextDocument, offset: number): Promise<any> => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('Completion.getCompletions', textDocument, offset)
}

export const resolveCompletionItem = async (
  textDocument: TextDocument,
  offset: number,
  name: string,
  completionItem: CompletionItem,
): Promise<any> => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('Completion.resolveCompletion', textDocument, offset, name, completionItem)
}
