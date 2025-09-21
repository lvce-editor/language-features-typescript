import * as LanguageId from '../LanguageId/LanguageId.ts'
import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.ts'

export const languageId = LanguageId.TypeScript

export const provideReferences = async (textDocument, offset) => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('References.provideReferences', textDocument, offset)
}

export const provideReferences2 = async ({ uri, position }) => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('References.provideReferences2', { uri, position })
}

export const provideFileReferences = async (textDocument) => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('References.provideFileReferences', textDocument)
}
