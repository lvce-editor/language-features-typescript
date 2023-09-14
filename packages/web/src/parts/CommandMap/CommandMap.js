import * as Completion from '../Completion/Completion.js'
import * as Configure from '../Configure/Configure.js'
import * as GetTsServerPath from '../GetTsServerPath/GetTsServerPath.js'
import * as Initialize from '../Initialize/Initialize.js'
import * as UpdateOpen from '../UpdateOpen/UpdateOpen.js'

export const commandMap = {
  'GetTsServerPath.getTsServerPath': GetTsServerPath.getTsServerPath,
  'Initialize.initialize': Initialize.initialize,
  'Configure.configure': Configure.configure,
  'UpdateOpen.updateOpen': UpdateOpen.updateOpen,
  'Completion.getCompletion': Completion.getCompletion,
}
