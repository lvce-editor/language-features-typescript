import * as TypeScriptRpc from '../TypeScriptRpc/TypeScriptRpc.ts'

export const openTextDocuments = async (textDocuments) => {
  await TypeScriptRpc.invoke('UpdateOpen.updateOpen', textDocuments)
}

export const openTextDocuments2 = async (rpc: any, textDocuments: any) => {
  return rpc.invoke('UpdateOpen.updateOpen', textDocuments)
}
