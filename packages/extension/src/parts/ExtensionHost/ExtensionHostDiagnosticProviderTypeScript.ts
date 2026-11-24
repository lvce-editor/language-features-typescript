import { createDiagnosticScheduler } from '../DiagnosticScheduler/DiagnosticScheduler.ts'
import * as IgnoreDiagnostics from '../IgnoreDiagnostics/IgnoreDiagnostics.ts'
import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.ts'
import * as WatchDiagnostics from '../WatchDiagnostics/WatchDiagnostics.ts'

export const languageId = 'typescript'

const scheduleDiagnostics = createDiagnosticScheduler(async (textDocument: any): Promise<any> => {
  if (await IgnoreDiagnostics.isVerified(textDocument)) return []
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('Diagnostic.getDiagnostics', textDocument)
})

export const provideDiagnostics = async (textDocument: any): Promise<readonly unknown[]> => {
  await WatchDiagnostics.ensure()
  return scheduleDiagnostics(textDocument, WatchDiagnostics.getRevision())
}
