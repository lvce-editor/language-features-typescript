import * as IsStyleDiagnostic from '../IsStyleDiagnostic/IsStyleDiagnostic.ts'

interface Diagnostic {
  readonly category: number | string
  readonly code?: number
}

export const getDiagnosticSeverity = (diagnostic: Diagnostic): 'error' | 'warning' => {
  const isError = diagnostic.category === 1 || diagnostic.category === 'error'
  if (IsStyleDiagnostic.isStyleCheckDiagnostic(diagnostic.code) && isError) {
    return 'warning'
  }
  return 'error'
}
