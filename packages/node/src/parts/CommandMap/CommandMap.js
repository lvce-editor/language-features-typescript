import { CommandNotFoundError } from '../CommandNotFoundError/CommandNotFoundError.js'
import * as CommandType from '../CommandType/CommandType.js'
import * as Completion from '../Completion/Completion.js'

export const getFn = (method) => {
  switch (method) {
    case CommandType.CompletionGetCompletion:
      return Completion.getCompletion
    default:
      throw new CommandNotFoundError(method)
  }
}
