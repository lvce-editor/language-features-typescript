import * as AddMissingImports from '../AddMissingImports/AddMissingImports.ts'
import * as BraceCompletion from '../BraceCompletion/BraceCompletion.ts'
import * as CodeActions from '../CodeActions/CodeActions.ts'
import * as Comment from '../Comment/Comment.ts'
import * as Completion from '../Completion/Completion.ts'
import * as Definition from '../Definition/Definition.ts'
import * as Diagnostics from '../Diagnostics/Diagnostics.ts'
import * as DocumentSymbols from '../DocumentSymbols/DocumentSymbols.ts'
import * as Hover from '../Hover/Hover.ts'
import * as Implementation from '../Implementation/Implementation.ts'
import * as Initialize from '../Initialize/Initialize.ts'
import * as OrganizeImports from '../OrganizeImports/OrganizeImports.ts'
import * as PrepareRename from '../PrepareRename/PrepareRename.ts'
import * as References from '../References/References.ts'
import * as Rename from '../Rename/Rename.ts'
import * as ResolveCompletion from '../ResolveCompletion/ResolveCompletion.ts'
import * as Selection from '../Selection/Selection.ts'
import * as SignatureHelp from '../SignatureHelp/SignatureHelp.ts'
import * as WrapCommand from '../WrapCommand/WrapCommand.ts'

export const commandMap = {
  'AddMissingImports.addMissingImports': WrapCommand.wrapCommand(AddMissingImports.addMissingImports),
  'BraceCompletion.provide': WrapCommand.wrapCommand(BraceCompletion.provide),
  'CodeActions.getCodeActions': WrapCommand.wrapCommand(CodeActions.getCodeActions),
  'Comment.provide': WrapCommand.wrapCommand(Comment.provide),
  'Completion.getCompletions': WrapCommand.wrapCommand(Completion.getCompletion),
  'Completion.resolveCompletion': WrapCommand.wrapCommand(ResolveCompletion.resolveCompletion),
  'Definition.getDefinition': WrapCommand.wrapCommand(Definition.getDefinition),
  'Diagnostic.getDiagnostics': WrapCommand.wrapCommand(Diagnostics.getDiagnostics),
  'Diagnostic.getFirstPerformanceTrace': WrapCommand.wrapCommand(Diagnostics.getFirstPerformanceTrace),
  'Diagnostic.getPerformanceTrace': WrapCommand.wrapCommand(Diagnostics.getPerformanceTrace),
  'DocumentSymbols.getDocumentSymbols': WrapCommand.wrapCommand(DocumentSymbols.getDocumentSymbols),
  'Hover.getHover': WrapCommand.wrapCommand(Hover.getHover),
  'Implementation.getImplementations': Implementation.getImplementations,
  'Initialize.initialize': Initialize.initialize,
  'OrganizeImports.organizeImports': WrapCommand.wrapCommand(OrganizeImports.organizeImports),
  'References.provideFileReferences': References.provideFileReferences,
  'References.provideReferences': References.provideReferences,
  'References.provideReferences2': References.provideReferences2,
  'Rename.prepareRename': WrapCommand.wrapCommand(PrepareRename.prepareRename),
  'Rename.rename': WrapCommand.wrapCommand(Rename.rename),
  'Selection.expandSelections': WrapCommand.wrapCommand(Selection.expandSelection),
  'SignatureHelp.getSignatureHelp': WrapCommand.wrapCommand(SignatureHelp.getSignatureHelp),
}
