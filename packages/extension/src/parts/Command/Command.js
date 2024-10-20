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

const RE_PROTOCOL = /^[a-z]+\:\/\//
const parseUri = (uri) => {
  const match = uri.match(RE_PROTOCOL)
  const protocol = match[0]
  const rest = uri.slice(protocol.length)
  return {
    protocol,
    rest,
  }
}
const readAllFiles = async (uri) => {
  const { protocol, rest } = parseUri(uri)
  console.log({ protocol, rest })
  const lastSlashIndex = rest.lastIndexOf('/')
  if (lastSlashIndex === -1) {
    return []
  }
  const parent = rest.slice(0, lastSlashIndex)
  const parentPath = protocol + parent

  console.log({ vscode })
  // @ts-ignore
  const dirents = await vscode.readDirWithFileTypes(parentPath)
  console.log('READ')
  console.log({ uri })
  return []
}

const getFn = (method) => {
  switch (method) {
    case 'TypeScriptRpc.invoke':
    case 'Completion.getCompletion':
    case 'ResolveCompletion.resolveCompletion':
      return rpcInvoke
    case 'TypeScriptRpc.listen':
      return rpcListen
    case 'Position.getOffset':
      return getOffset
    case 'Position.getPosition':
      return getPosition
    case 'FileSystem.readAllFiles':
      return readAllFiles
    default:
      throw new Error(`method ${method} not found`)
  }
}

export const execute = (method, ...params) => {
  const fn = getFn(method)
  return fn(...params)
}
