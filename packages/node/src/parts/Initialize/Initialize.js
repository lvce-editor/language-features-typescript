import * as TsPrimaryServer from '../TsPrimaryServer/TsPrimaryServer.js'
import * as Assert from '../Assert/Assert.js'

export const initialize = async ({ tsServerPath }) => {
  Assert.string(tsServerPath)
  await TsPrimaryServer.start({ tsServerPath })
}
