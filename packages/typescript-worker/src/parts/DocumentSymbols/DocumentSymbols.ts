import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import type { DocumentSymbol } from '../DocumentSymbol/DocumentSymbol.ts'
import { getDocumentSymbols2 } from '../DocumentSymbols2/DocumentSymbols2.ts'

export const getDocumentSymbols = async (
  typeScriptRpc: CommonRpc,
  Position: any,
  textDocument: any,
): Promise<readonly DocumentSymbol[]> => {
  return getDocumentSymbols2(textDocument)
}
