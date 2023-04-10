import { CommandNotFoundError } from '../CommandNotFoundError/CommandNotFoundError.js'
import * as CommandType from '../CommandType/CommandType.js'
import * as Completion from '../Completion/Completion.js'
import * as Definition from '../Definition/Definition.js'
import * as GetTsServerPath from '../GetTsServerPath/GetTsServerPath.js'
import * as Initialize from '../Initialize/Initialize.js'
import * as References from '../Refererences/References.js'
import * as UpdateOpen from '../UpdateOpen/UpdateOpen.js'

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
    default:
      throw new CommandNotFoundError(method)
  }
}
