import * as Rpc from '../TypeScriptRpc/TypeScriptRpc.ts'

export const onWillChangeTextDocument = async (textDocument, edits) => {
  console.log(textDocument, edits)
}

export const openTextDocuments = async (textDocuments) => {
  await Rpc.invoke('UpdateOpen.updateOpen', textDocuments)
}
