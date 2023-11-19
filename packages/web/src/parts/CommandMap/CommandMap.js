import * as Completion from '../Completion/Completion.js'
import * as Configure from '../Configure/Configure.js'
import * as GetTsServerPath from '../GetTsServerPath/GetTsServerPath.js'
import * as Initialize from '../Initialize/Initialize.js'
import * as UpdateOpen from '../UpdateOpen/UpdateOpen.js'
import * as Diagnostics from '../Diagnostics/Diagnostic.js'

export const commandMap = {
  'Completion.getCompletion': Completion.getCompletion,
  'Configure.configure': Configure.configure,
  'Diagnostic.getDiagnostics': Diagnostics.getDiagnostics,
  'GetTsServerPath.getTsServerPath': GetTsServerPath.getTsServerPath,
  'Initialize.initialize': Initialize.initialize,
  'UpdateOpen.updateOpen': UpdateOpen.updateOpen,
}
