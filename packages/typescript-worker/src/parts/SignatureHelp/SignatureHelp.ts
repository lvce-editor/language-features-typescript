import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import * as Assert from '../Assert/Assert.ts'
import { getSignatureHelp2 } from '../SignatureHelp2/SignatureHelp2.ts'

export const getSignatureHelp = async (typescriptRpc: CommonRpc, Position: any, textDocument: any, offset: number) => {
  const { uri } = textDocument
  Assert.string(uri)
  Assert.number(offset)
  return getSignatureHelp2(textDocument, offset)
}
