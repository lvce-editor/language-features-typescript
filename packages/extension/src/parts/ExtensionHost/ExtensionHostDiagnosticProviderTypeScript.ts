import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.js'

export const languageId = 'typescript'

/**
 */
export const provideDiagnostics = async (textDocument) => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('Diagnostic.getDiagnostics', textDocument)
}
