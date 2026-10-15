import * as LanguageId from '../LanguageId/LanguageId.ts'
import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.ts'

export const languageId = LanguageId.TypeScript

export const provideDefinition = createInteractiveRequestScheduler(async (textDocument, offset) => {
  const worker = await TypeScriptWorker.getInstance()
  const definition = await worker.invoke('Definition.getDefinition', textDocument, offset)
  return definition ?? null
})
import { createInteractiveRequestScheduler } from '../InteractiveRequestScheduler/InteractiveRequestScheduler.ts'
