import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.js'

export const invoke = async (method, ...params) => {
  const rpc = await TypeScriptWorker.getInstance()
  return rpc.invoke(method, ...params)
}
