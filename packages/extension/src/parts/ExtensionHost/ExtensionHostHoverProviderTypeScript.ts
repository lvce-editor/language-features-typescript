import * as LanguageId from '../LanguageId/LanguageId.ts'
import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.ts'

export const languageId = LanguageId.TypeScript

/**
 */
export const provideHover = createInteractiveRequestScheduler(async (textDocument, offset) => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('Hover.getHover', textDocument, offset)
})
import { createInteractiveRequestScheduler } from '../InteractiveRequestScheduler/InteractiveRequestScheduler.ts'
