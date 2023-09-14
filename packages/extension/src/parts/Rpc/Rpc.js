import * as GetTsClientPath from '../GetTsClientPathNode/GetTsClientPathNode.js'

export const state = {
  rpc: undefined,
}

export const listen = async ({ path }) => {
  const tsPath = GetTsClientPath.getTsClientPathNode(path)
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
