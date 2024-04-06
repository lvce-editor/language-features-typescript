import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.js'

/**
 * @type {any }
 */
export const provideCompletions = async (textDocument, offset) => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('Completion.getCompletions', textDocument, offset)
}

// /**
//  * @type {any}
//  */
export const resolveCompletionItem = async (textDocument, offset, name, completionItem) => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('Completion.resolveCompletion', textDocument, offset, name, completionItem)
}
