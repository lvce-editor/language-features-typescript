import * as TsPrimaryServer from '../TsPrimaryServer/TsPrimaryServer.js'
import * as GetTsServerPath from '../GetTsServerPath/GetTsServerPath.js'

export const initialize = async () => {
  const tsServerPath = GetTsServerPath.getDefaultTsServerPath()
  await TsPrimaryServer.start({ tsServerPath })
}
