import * as TypeScriptRpc from '../TypeScriptRpc/TypeScriptRpc.ts'

export const initialize = async (path: string) => {
  await TypeScriptRpc.listen({ path })
}
