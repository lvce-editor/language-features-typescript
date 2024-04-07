import * as TypeScriptRpc from '../TypeScriptRpc/TypeScriptRpc.ts'

export const openTextDocuments = async (textDocuments) => {
  await TypeScriptRpc.invoke('UpdateOpen.updateOpen', textDocuments)
}
