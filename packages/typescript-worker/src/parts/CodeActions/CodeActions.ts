import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import { getCodeActions2 } from '../CodeActions2/CodeActions2.ts'

export const getCodeActions = async (
  _typescriptRpc: CommonRpc,
  _Position: unknown,
  textDocument: any,
  offset: number,
): Promise<readonly any[]> => {
  return getCodeActions2(textDocument, offset)
}
