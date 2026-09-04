import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import { expandSelection2 } from '../Selection2/Selection2.ts'

export const expandSelection = async (
  _typeScriptRpc: CommonRpc,
  _Position: any,
  textDocument: any,
  positions: readonly number[] | Uint32Array,
): Promise<number[]> => {
  return expandSelection2(textDocument, positions)
}
