import * as TypeScriptRpc from '../TypeScriptRpc/TypeScriptRpc.ts'

export const onWillChangeTextDocument = async (textDocument, edits) => {
  console.log(textDocument, edits)
}

export const openTextDocuments = async (textDocuments) => {
  await TypeScriptRpc.invoke('UpdateOpen.updateOpen', textDocuments)
}
