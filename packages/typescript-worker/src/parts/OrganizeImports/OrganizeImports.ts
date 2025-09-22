import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import * as Assert from '../Assert/Assert.ts'
import { organizeImports2 } from '../OrganizeImports2/OrganizeImports2.ts'

export const organizeImports = async (typescriptRpc: CommonRpc, Position: any, textDocument: any) => {
  const uri = textDocument.uri
  Assert.string(uri)
  return organizeImports2(textDocument)
}
