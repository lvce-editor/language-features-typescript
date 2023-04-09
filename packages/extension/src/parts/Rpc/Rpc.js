import * as Callback from '../Callback/Callback.js'

export const state = {
  rpc: undefined,
}

const getTsPath = (path) => {
  return `${path}/../node/src/typeScriptClient.js`
}

const handleMessage = (message) => {
  console.log({ message })
  Callback.resolve(message.id, message)
}

export const listen = async ({ path }) => {
  const tsPath = getTsPath(path)
  const rpc = await vscode.createNodeRpc({
    path: tsPath,
  })
  state.rpc = rpc
}

export const invoke = async (method, ...params) => {
  const rpc = state.rpc
  const result = await state.rpc.invoke(method, ...params)
  return result
}
