import * as FileReferences from '../FileReferences/FileReferences.ts'
import * as GetReferencesFromTsResult from '../GetReferencesFromTsResult/GetReferencesFromTsResult.ts'
import * as Position from '../Position/Position.ts'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.ts'
import * as TypeScriptRpc from '../TypeScriptRpc/TypeScriptRpc.ts'

const getReferences = async (textDocument: any, offset: number) => {
  await TextDocumentSync.openTextDocuments([textDocument])
  const tsPosition = await Position.getTsPosition(textDocument, offset)
  const tsResult = await TypeScriptRpc.invoke('References.getReferences', {
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  return tsResult
}

export const provideReferences = async (textDocument: any, offset: number) => {
  const tsResult = await getReferences(textDocument, offset)
  const references = GetReferencesFromTsResult.getReferencesFromTsResult(textDocument, tsResult)
  return references
}

export const provideFileReferences = async (textDocument: any) => {
  const tsResult = await FileReferences.getFileReferences(textDocument)
  const fileReferences = tsResult
  return fileReferences
}
