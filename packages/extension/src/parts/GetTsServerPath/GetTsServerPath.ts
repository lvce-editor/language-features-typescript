import * as Rpc from '../Rpc/Rpc.ts'

export const getTsServerPath = async () => {
  const tsServerPath = await Rpc.invoke('GetTsServerPath.getTsServerPath')
  return tsServerPath
}
