import * as GetTypeScriptRpc from '../GetTypeScriptRpc/GetTypeScriptRpc.ts'

export const state = {
  rpc: undefined,
}

export const listen = async ({ path }) => {
  state.rpc = await GetTypeScriptRpc.getRpc(path)
}

export const invoke = async (method, ...params) => {
  const result = await state.rpc.invoke(method, ...params)
  return result
}
