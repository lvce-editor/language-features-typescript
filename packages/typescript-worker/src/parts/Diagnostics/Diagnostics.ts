import type { Diagnostic } from '../Diagnostic/Diagnostic.ts'
import * as TypeScriptRpc from '../TypeScriptRpc/TypeScriptRpc.ts'
import * as GetDiagnosticFromTsResult from '../GetDiagnosticFromTsResult/GetDiagnosticFromTsResult.ts'

export const getDiagnostics = async (textDocument): Promise<readonly Diagnostic[]> => {
  await TypeScriptRpc.invoke('UpdateOpen.updateOpen', [textDocument])
  const tsResult = await TypeScriptRpc.invoke('Diagnostic.getDiagnostics', {
    file: textDocument.uri,
  })
  const diagnostics = GetDiagnosticFromTsResult.getDiagnosticsFromTsResult(textDocument, tsResult)
  return diagnostics
}
