import { CommandNotFoundError } from '../CommandNotFoundError/CommandNotFoundError.js'
import * as CommandType from '../CommandType/CommandType.js'
import * as Completion from '../Completion/Completion.js'
import * as Initialize from '../Initialize/Initialize.js'
import * as UpdateOpen from '../UpdateOpen/UpdateOpen.js'

export const getFn = (method) => {
  switch (method) {
    case CommandType.CompletionGetCompletion:
      return Completion.getCompletion
    case CommandType.Initialize:
      return Initialize.initialize
    case CommandType.UpdateOpen:
      return UpdateOpen.updateOpen
    default:
      throw new CommandNotFoundError(method)
  }
}
