import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import { rename2 } from '../Rename2/Rename2.ts'

export const rename = async (
  typeScriptRpc: CommonRpc,
  Position: any,
  textDocument: any,
  offset: number,
  newName: string,
) => {
  return rename2(textDocument, offset, newName)
}
