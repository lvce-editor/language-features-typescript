import { CommandNotFoundError } from '../CommandNotFoundError/CommandNotFoundError.js'
import * as CommandType from '../CommandType/CommandType.js'
import * as Completion from '../Completion/Completion.js'
import * as Initialize from '../Initialize/Initialize.js'

export const getFn = (method) => {
  switch (method) {
    case CommandType.CompletionGetCompletion:
      return Completion.getCompletion
    case CommandType.Initialize:
      return Initialize.initialize
    default:
      throw new CommandNotFoundError(method)
  }
}
