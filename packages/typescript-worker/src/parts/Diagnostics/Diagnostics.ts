import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import type { Diagnostic } from '../Diagnostic/Diagnostic.ts'
import * as Diagnostics2 from '../Diagnostics2/Diagnostics2.ts'

export const getDiagnostics = async (
  typescriptRpc: CommonRpc,
  Position,
  textDocument,
): Promise<readonly Diagnostic[]> => {
  return Diagnostics2.getDiagnostics2(textDocument)
}

export const getPerformanceTrace = async (typescriptRpc: CommonRpc, Position, textDocument) => {
  return Diagnostics2.getPerformanceTrace(textDocument)
}
