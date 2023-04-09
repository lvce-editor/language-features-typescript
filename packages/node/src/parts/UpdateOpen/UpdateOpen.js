import * as TextDocuments from '../TextDocuments/TextDocuments.js'
import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'

const toTsOpenFile = (textDocument) => {
  return {
    file: textDocument.uri,
    fileContent: textDocument.text,
  }
}

const toTsOpenFiles = (textDocuments) => {
  return textDocuments.map(toTsOpenFile)
}

const getTsEdit = (textDocuments) => {
  return {
    openFiles: toTsOpenFiles(textDocuments),
  }
}

export const updateOpen = (textDocuments) => {
  for (const textDocument of textDocuments) {
    TextDocuments.setUri(textDocument.uri, textDocument.text)
  }
  const tsEdit = getTsEdit(textDocuments)
  TsServerRequests.updateOpen(tsEdit)
}
