import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import { provideBraceCompletion } from '../BraceCompletion2/BraceCompletion2.ts'

export const provide = async (
  typeScriptRpc: CommonRpc,
  Position: any,
  textDocument: any,
  offset: number,
  openingBrace: string,
) => {
  return provideBraceCompletion(textDocument, offset, openingBrace)
}
