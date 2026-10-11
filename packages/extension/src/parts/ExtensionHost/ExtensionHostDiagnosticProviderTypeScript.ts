import * as IgnoreDiagnostics from '../IgnoreDiagnostics/IgnoreDiagnostics.ts'
import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.ts'

export const languageId = 'typescript'

/**
 */
export const provideDiagnostics = async (textDocument: any): Promise<any> => {
  if (await IgnoreDiagnostics.isVerified(textDocument)) return []
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('Diagnostic.getDiagnostics', textDocument)
}
