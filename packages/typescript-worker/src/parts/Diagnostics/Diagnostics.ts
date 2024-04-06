import type { Diagnostic } from '../Diagnostic/Diagnostic.ts'
import * as TypeScriptRpc from '../TypeScriptRpc/TypeScriptRpc.ts'

export const getDiagnostics = async (textDocument): Promise<readonly Diagnostic[]> => {
  await TypeScriptRpc.invoke('UpdateOpen.updateOpen', [textDocument])
  const tsResult = await TypeScriptRpc.invoke('Diagnostic.getDiagnostics', {
    file: textDocument.uri,
  })
  console.log({ tsResult })
  return [
    {
      uri: textDocument.uri,
      rowIndex: 0,
      columnIndex: 0,
      message: 'test error 1',
    },
  ]
}
