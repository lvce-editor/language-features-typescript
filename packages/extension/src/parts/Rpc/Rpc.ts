import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.ts'

export const invoke = async (method: string, ...params: any[]): Promise<any> => {
  const rpc = await TypeScriptWorker.getInstance()
  return rpc.invoke(method, ...params)
}
