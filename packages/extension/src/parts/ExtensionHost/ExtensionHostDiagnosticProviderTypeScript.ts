import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.ts'

export const languageId = 'typescript'

/**
 */
export const provideDiagnostics = async (textDocument: any): Promise<any> => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('Diagnostic.getDiagnostics', textDocument)
}
