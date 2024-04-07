import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import type { Diagnostic } from '../Diagnostic/Diagnostic.ts'
import * as GetDiagnosticFromTsResult from '../GetDiagnosticFromTsResult/GetDiagnosticFromTsResult.ts'
import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.ts'

export const getDiagnostics = async (
  typescriptRpc: CommonRpc,
  Position,
  textDocument,
): Promise<readonly Diagnostic[]> => {
  await typescriptRpc.invoke('UpdateOpen.updateOpen', [textDocument])
  const tsResult = await typescriptRpc.invoke<TypeScriptProtocol.Diagnostic[]>('Diagnostic.getDiagnostics', {
    file: textDocument.uri,
  })
  const diagnostics = GetDiagnosticFromTsResult.getDiagnosticsFromTsResult(textDocument, tsResult)
  return diagnostics
}
