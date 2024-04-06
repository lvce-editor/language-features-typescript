import * as IsStyleDiagnostic from '../IsStyleDiagnostic/IsStyleDiagnostic.ts'

export const getDiagnosticSeverity = (diagnostic) => {
  if (IsStyleDiagnostic.isStyleCheckDiagnostic(diagnostic.code) && diagnostic.category === 'error') {
    return 'warning'
  }
  return 'error'
}
