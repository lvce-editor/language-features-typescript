import * as Rpc from '../Rpc/Rpc.js'

const rpcInvoke = (...params) => {
  return Rpc.invoke(...params)
}

const rpcListen = (path) => {
  return Rpc.listen({ path })
}

const getOffset = (textDocument, position) => {
  // @ts-ignore
  return vscode.getOffset(textDocument, position)
}

const getPosition = (textDocument, offset) => {
  // @ts-ignore
  return vscode.getPosition(textDocument, offset)
}

const getFn = (method) => {
  switch (method) {
    case 'TypeScriptRpc.invoke':
      return rpcInvoke
    case 'TypeScriptRpc.listen':
      return rpcListen
    case 'Position.getOffset':
      return getOffset
    case 'Position.getPosition':
      return getPosition
    default:
      throw new Error('method not found')
  }
}

export const execute = (method, ...params) => {
  const fn = getFn(method)
  return fn(...params)
}
