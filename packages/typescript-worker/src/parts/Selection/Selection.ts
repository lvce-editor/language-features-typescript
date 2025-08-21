import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import { expandSelection2 } from '../Selection2/Selection2.ts'

export const expandSelection = async (
  typeScriptRpc: CommonRpc,
  Position: any,
  textDocument: any,
  positions: Uint32Array,
) => {
  return expandSelection2(textDocument, positions)
}
