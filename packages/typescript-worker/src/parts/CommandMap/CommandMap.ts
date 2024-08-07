import * as Completion from '../Completion/Completion.ts'
import * as Definition from '../Definition/Definition.ts'
import * as Diagnostics from '../Diagnostics/Diagnostics.ts'
import * as Hover from '../Hover/Hover.ts'
import * as Initialize from '../Initialize/Initialize.ts'
import * as OrganizeImports from '../OrganizeImports/OrganizeImports.ts'
import * as References from '../References/References.ts'
import * as ResolveCompletion from '../ResolveCompletion/ResolveCompletion.ts'
import * as Selection from '../Selection/Selection.ts'
import * as WrapCommand from '../WrapCommand/WrapCommand.ts'

export const commandMap = {
  'Completion.getCompletions': WrapCommand.wrapCommand(Completion.getCompletion),
  'Completion.resolveCompletion': WrapCommand.wrapCommand(ResolveCompletion.resolveCompletion),
  'Diagnostic.getDiagnostics': WrapCommand.wrapCommand(Diagnostics.getDiagnostics),
  'Hover.getHover': WrapCommand.wrapCommand(Hover.getHover),
  'Initialize.initialize': Initialize.initialize,
  'References.provideReferences': References.provideReferences,
  'References.provideFileReferences': References.provideFileReferences,
  'OrganizeImports.organizeImports': WrapCommand.wrapCommand(OrganizeImports.organizeImports),
  'Definition.getDefinition': WrapCommand.wrapCommand(Definition.getDefinition),
  'Selection.expandSelections': WrapCommand.wrapCommand(Selection.expandSelection),
}
