import * as LanguageId from '../LanguageId/LanguageId.js'
import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.js'

export const languageId = LanguageId.TypeScript

export const provideDefinition = async (textDocument, offset) => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('Definition.getDefinition', textDocument, offset)
}
