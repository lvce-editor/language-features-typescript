import * as LanguageId from '../LanguageId/LanguageId.ts'
import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.ts'

export const languageId = LanguageId.TypeScript

export const provideDefinition = async (textDocument: any, offset: number): Promise<any> => {
  const worker = await TypeScriptWorker.getInstance()
  const definition = await worker.invoke('Definition.getDefinition', textDocument, offset)
  return definition ?? null
}
