import * as CommandType from '../CommandType/CommandType.js'
import * as Completion from '../Completion/Completion.js'
import * as Definition from '../Definition/Definition.js'
import * as FileSystem from '../FileSystem/FileSystem.js'
import * as GetTsServerPath from '../GetTsServerPath/GetTsServerPath.js'
import * as Hover from '../Hover/Hover.js'
import * as Implementation from '../Implementation/Implementation.js'
import * as Initialize from '../Initialize/Initialize.js'
import * as References from '../Refererences/References.js'
import * as TypeDefinition from '../TypeDefinition/TypeDefinition.js'
import * as UpdateOpen from '../UpdateOpen/UpdateOpen.js'

export const commandMap = {
  [CommandType.CompletionGetCompletion]: Completion.getCompletion,
  [CommandType.Initialize]: Initialize.initialize,
  [CommandType.UpdateOpen]: UpdateOpen.updateOpen,
  [CommandType.GetTsServerPath]: GetTsServerPath.getDefaultTsServerPath,
  [CommandType.GetDefinition]: Definition.getDefinition,
  [CommandType.GetReferences]: References.getReferences,
  [CommandType.GetImplementations]: Implementation.getImplementations,
  [CommandType.FileSystemReadFile]: FileSystem.readFile,
  [CommandType.GetTypeDefinition]: TypeDefinition.getTypeDefinition,
  [CommandType.GetHover]: Hover.getHover,
}
