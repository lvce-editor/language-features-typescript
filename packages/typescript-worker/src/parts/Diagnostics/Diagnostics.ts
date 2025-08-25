import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import type { Diagnostic } from '../Diagnostic/Diagnostic.ts'
import { getDiagnostics2 } from '../Diagnostics2/Diagnostics2.ts'

export const getDiagnostics = async (
  typescriptRpc: CommonRpc,
  Position,
  textDocument,
): Promise<readonly Diagnostic[]> => {
  return getDiagnostics2(textDocument)
}
