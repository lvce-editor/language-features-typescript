import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.js'

interface TextDocument {
  uri: string
  languageId: string
  version: number
  text: string
}

interface CompletionItem {
  label: string
  kind?: number
  detail?: string
  documentation?: string
  insertText?: string
  sortText?: string
  filterText?: string
  additionalTextEdits?: any[]
  command?: any
  commitCharacters?: string[]
  preselect?: boolean
  insertTextFormat?: number
  range?: any
}

export const provideCompletions = async (textDocument: TextDocument, offset: number): Promise<any> => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('Completion.getCompletions', textDocument, offset)
}

export const resolveCompletionItem = async (textDocument: TextDocument, offset: number, name: string, completionItem: CompletionItem): Promise<any> => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('Completion.resolveCompletion', textDocument, offset, name, completionItem)
}
