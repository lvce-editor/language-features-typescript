import * as Rpc from '../Rpc/Rpc.js'

const rpcInvoke = (...params) => {
  return Rpc.invoke(...params)
}

const rpcListen = (path) => {
  return Rpc.listen({ path })
}

const getFn = (method) => {
  switch (method) {
    case 'TypeScriptRpc.invoke':
      return rpcInvoke
    case 'TypeScriptRpc.listen':
      return rpcListen
    default:
      throw new Error('method not found')
  }
}

export const execute = (method, ...params) => {
  const fn = getFn(method)
  return fn(...params)
}
