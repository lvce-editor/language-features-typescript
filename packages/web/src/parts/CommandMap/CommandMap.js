import * as GetTsServerPath from '../GetTsServerPath/GetTsServerPath.js'
import * as Initialize from '../Initialize/Initialize.js'
import * as Configure from '../Configure/Configure.js'

export const commandMap = {
  'GetTsServerPath.getTsServerPath': GetTsServerPath.getTsServerPath,
  'Initialize.initialize': Initialize.initialize,
  'Configure.configure': Configure.configure,
}
