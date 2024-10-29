import * as CommandType from '../CommandType/CommandType.js'
import * as Completion from '../Completion/Completion.js'
import * as Configure from '../Configure/Configure.js'
import * as Definition from '../Definition/Definition.js'
import * as Diagnostic from '../Diagnostic/Diagnostic.js'
import * as FileSystem from '../FileSystem/FileSystem.js'
import * as GetTsServerPath from '../GetTsServerPath/GetTsServerPath.js'
import * as Hover from '../Hover/Hover.js'
import * as Implementation from '../Implementation/Implementation.js'
import * as Initialize from '../Initialize/Initialize.js'
import * as OrganizeImports from '../OrganizeImports/OrganizeImports.js'
import * as References from '../Refererences/References.js'
import * as Rename from '../Rename/Rename.js'
import * as ResolveCompletion from '../ResolveCompletion/ResolveCompletion.js'
import * as Selection from '../Selection/Selection.js'
import * as TypeDefinition from '../TypeDefinition/TypeDefinition.js'
import * as UpdateOpen from '../UpdateOpen/UpdateOpen.js'

export const commandMap = {
  [CommandType.CompletionGetCompletion]: Completion.getCompletion,
  [CommandType.Configure]: Configure.configure,
  [CommandType.DiagnosticGetDiagnostics]: Diagnostic.getDiagnostic,
  [CommandType.ExpandSelection]: Selection.expandSelection,
  [CommandType.FileSystemReadFile]: FileSystem.readFile,
  [CommandType.GetDefinition]: Definition.getDefinition,
  [CommandType.GetFileReferences]: References.getFileReferences,
  [CommandType.GetHover]: Hover.getHover,
  [CommandType.GetImplementations]: Implementation.getImplementations,
  [CommandType.GetReferences]: References.getReferences,
  [CommandType.GetTsServerPath]: GetTsServerPath.getDefaultTsServerPath,
  [CommandType.GetTypeDefinition]: TypeDefinition.getTypeDefinition,
  [CommandType.Initialize]: Initialize.initialize,
  [CommandType.OrganizeImports]: OrganizeImports.organizeImports,
  [CommandType.ResolveCompletionItem]: ResolveCompletion.resolveCompletion,
  [CommandType.UpdateOpen]: UpdateOpen.updateOpen,
  [CommandType.Rename]: Rename.rename,
}
