import * as Command from './parts/Command/Command.js'
import * as CommandMap from './parts/CommandMap/CommandMap.js'

Command.state.getFn = CommandMap.getFn

export const execute = Command.execute
