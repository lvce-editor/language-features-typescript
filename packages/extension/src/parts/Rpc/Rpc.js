import * as GetTsClientPath from '../GetTsClientPath/GetTsClientPath.js'

export const state = {
  rpc: undefined,
}

export const listen = async ({ path }) => {
  const tsPath = GetTsClientPath.getTsClientPath(path)
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
