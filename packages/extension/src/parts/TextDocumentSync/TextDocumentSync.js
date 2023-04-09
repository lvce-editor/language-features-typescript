import * as Debug from '../Debug/Debug.js'
import * as Rpc from '../Rpc/Rpc.js'

export const onWillChangeTextDocument = async (textDocument, edits) => {
  console.log(textDocument, edits)
  Debug.debug('changing text document', textDocument)
}

export const openTextDocuments = async (textDocuments) => {
  Debug.debug('open text documents', textDocuments)
  await Rpc.invoke('UpdateOpen.updateOpen', textDocuments)
}
