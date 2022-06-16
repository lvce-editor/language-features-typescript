import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'
import * as Debug from '../Debug/Debug.js'

export const onWillChangeTextDocument = async (textDocument, edits) => {
  console.log(textDocument, edits)
  Debug.debug('changing text document', textDocument)
}

export const openTextDocuments = async (textDocuments) => {
  Debug.debug('open text documents', textDocuments)
}
