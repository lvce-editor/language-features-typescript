import * as Debug from '../Debug/Debug.ts'
import * as Rpc from '../Rpc/Rpc.ts'

export const onWillChangeTextDocument = async (textDocument, edits) => {
  console.log(textDocument, edits)
  // @ts-ignore
  Debug.debug('changing text document', textDocument)
}

export const openTextDocuments = async (textDocuments) => {
  // @ts-ignore
  Debug.debug('open text documents', textDocuments)
  await Rpc.invoke('UpdateOpen.updateOpen', textDocuments)
}
