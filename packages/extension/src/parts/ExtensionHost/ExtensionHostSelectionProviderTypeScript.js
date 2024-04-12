import * as LanguageId from '../LanguageId/LanguageId.js'
import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.js'

export const languageId = LanguageId.TypeScript

export const provideSelections = async (textDocument, positions) => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('Selection.expandSelections', textDocument, positions)
}
