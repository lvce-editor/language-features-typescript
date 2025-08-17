import * as Assert from '../Assert/Assert.ts'
import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import { getHover2 } from '../Hover2/Hover2.ts'

export const getHover = async (typescriptRpc: CommonRpc, Position: any, textDocument: any, offset: number) => {
  const uri = textDocument.uri
  Assert.string(uri)
  Assert.number(offset)
  const result = await getHover2(textDocument, offset)
  return result
}
