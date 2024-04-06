import * as Completion from '../Completion/Completion.ts'
import * as Diagnostics from '../Diagnostics/Diagnostics.ts'
import * as Initialize from '../Initialize/Initialize.ts'
import * as ResolveCompletion from '../ResolveCompletion/ResolveCompletion.ts'
import * as Hover from '../Hover/Hover.ts'

export const commandMap = {
  'Completion.getCompletions': Completion.getCompletion,
  'Completion.resolveCompletion': ResolveCompletion.resolveCompletion,
  'Diagnostic.getDiagnostics': Diagnostics.getDiagnostics,
  'Hover.getHover': Hover.getHover,
  'Initialize.initialize': Initialize.initialize,
}
