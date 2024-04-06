import * as Diagnostics from '../Diagnostics/Diagnostics.ts'
import * as Initialize from '../Initialize/Initialize.ts'

export const commandMap = {
  'Diagnostic.getDiagnostics': Diagnostics.getDiagnostics,
  'Initialize.initialize': Initialize.initialize,
}
