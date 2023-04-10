import { CommandNotFoundError } from '../CommandNotFoundError/CommandNotFoundError.js'
import * as CommandType from '../CommandType/CommandType.js'
import * as Completion from '../Completion/Completion.js'
import * as Definition from '../Definition/Definition.js'
import * as FileSystem from '../FileSystem/FileSystem.js'
import * as GetTsServerPath from '../GetTsServerPath/GetTsServerPath.js'
import * as Implementation from '../Implementation/Implementation.js'
import * as Initialize from '../Initialize/Initialize.js'
import * as References from '../Refererences/References.js'
import * as UpdateOpen from '../UpdateOpen/UpdateOpen.js'

/**
 * @param {string} method
 */
export const getFn = (method) => {
  switch (method) {
    case CommandType.CompletionGetCompletion:
      return Completion.getCompletion
    case CommandType.Initialize:
      return Initialize.initialize
    case CommandType.UpdateOpen:
      return UpdateOpen.updateOpen
    case CommandType.GetTsServerPath:
      return GetTsServerPath.getDefaultTsServerPath
    case CommandType.GetDefinition:
      return Definition.getDefinition
    case CommandType.GetReferences:
      return References.getReferences
    case CommandType.GetImplementations:
      return Implementation.getImplementations
    case CommandType.FileSystemReadFile:
      return FileSystem.readFile
    default:
      throw new CommandNotFoundError(method)
  }
}
