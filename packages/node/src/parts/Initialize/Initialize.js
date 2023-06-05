import * as TsPrimaryServer from '../TsPrimaryServer/TsPrimaryServer.js'
import * as Assert from '../Assert/Assert.js'

export const initialize = async ({ tsServerPath, argv, execArgv }) => {
  Assert.string(tsServerPath)
  Assert.array(argv)
  Assert.array(execArgv)
  await TsPrimaryServer.start({ tsServerPath, argv, execArgv })
}
