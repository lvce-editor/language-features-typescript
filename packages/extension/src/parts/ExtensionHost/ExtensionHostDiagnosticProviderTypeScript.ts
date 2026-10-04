import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.ts'

export const languageId = 'typescript'

/**
 */
export const provideDiagnostics = async (textDocument: any): Promise<any> => {
  console.info(
    'LVCE_TS_DIAGNOSTIC ' +
      JSON.stringify({
        stage: 'provider:start',
        timeOrigin: performance.timeOrigin,
        time: performance.now(),
        uri: textDocument.uri,
      }),
  )
  const worker = await TypeScriptWorker.getInstance()
  console.info(
    'LVCE_TS_DIAGNOSTIC ' +
      JSON.stringify({
        stage: 'provider:worker-ready',
        timeOrigin: performance.timeOrigin,
        time: performance.now(),
        uri: textDocument.uri,
      }),
  )
  const diagnostics = await worker.invoke('Diagnostic.getDiagnostics', textDocument)
  console.info(
    'LVCE_TS_DIAGNOSTIC ' +
      JSON.stringify({
        stage: 'provider:done',
        timeOrigin: performance.timeOrigin,
        time: performance.now(),
        uri: textDocument.uri,
        count: diagnostics.length,
      }),
  )
  return diagnostics
}
