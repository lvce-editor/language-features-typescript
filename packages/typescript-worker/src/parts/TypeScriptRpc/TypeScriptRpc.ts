import * as Rpc from '../Rpc/Rpc.ts'

export const invoke = async (method, ...params) => {
  return Rpc.invoke('TypeScriptRpc.invoke', method, ...params)
}

export const listen = (path: string) => {
  return Rpc.invoke('TypeScriptRpc.listen', path)
}
