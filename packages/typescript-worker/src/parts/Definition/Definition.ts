import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import { getDefinition2 } from '../Definition2/Definition2.ts'

export const getDefinition = async (typescriptRpc: CommonRpc, Position: any, textDocument: any, offset: number) => {
  return getDefinition2(textDocument, offset)
}
