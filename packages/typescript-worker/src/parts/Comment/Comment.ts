import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import * as Assert from '../Assert/Assert.ts'

export const provide = async (typeScriptRpc: CommonRpc, Position: any, textDocument: any, offset: number) => {
  const { uri } = textDocument
  Assert.string(uri)
  return ['/*', '*/']
}
