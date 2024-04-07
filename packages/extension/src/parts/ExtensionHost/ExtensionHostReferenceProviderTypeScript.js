import * as LanguageId from '../LanguageId/LanguageId.js'
import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.js'

export const languageId = LanguageId.TypeScript

export const provideReferences = async (textDocument, offset) => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('References.provideReferences', textDocument, offset)
}

export const provideFileReferences = async (textDocument) => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('References.provideFileReferences', textDocument)
}
