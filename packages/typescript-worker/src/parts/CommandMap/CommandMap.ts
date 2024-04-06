import * as Completion from '../Completion/Completion.ts'
import * as Diagnostics from '../Diagnostics/Diagnostics.ts'
import * as Initialize from '../Initialize/Initialize.ts'
import * as ResolveCompletion from '../ResolveCompletion/ResolveCompletion.ts'

export const commandMap = {
  'Diagnostic.getDiagnostics': Diagnostics.getDiagnostics,
  'Initialize.initialize': Initialize.initialize,
  'Completion.getCompletions': Completion.getCompletion,
  'Completion.resolveCompletion': ResolveCompletion.resolveCompletion,
}
