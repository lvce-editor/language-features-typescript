import * as GetRpc from '../GetRpc/GetRpc.js'

export const state = {
  rpc: undefined,
}

export const listen = async ({ path }) => {
  state.rpc = await GetRpc.getRpc(path)
}

export const invoke = async (method, ...params) => {
  const rpc = state.rpc
  const result = await state.rpc.invoke(method, ...params)
  return result
}
