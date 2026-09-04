import * as FileReferences from '../FileReferences/FileReferences.ts'
import { getOffset } from '../GetOffset/GetOffset.ts'
import { getOrCreateLanguageService } from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'
import { getReferencesFromTsResult2 } from '../GetReferencesFromTsResult2/GetReferencesFromTsResult2.ts'
import * as Rpc from '../Rpc/Rpc.ts'

export const provideReferences = async (textDocument: any, offset: number) => {
  const { fs, languageService } = getOrCreateLanguageService(textDocument.uri)
  fs.writeFile(textDocument.uri, textDocument.text)
  const tsResult = languageService.getReferencesAtPosition(textDocument.uri, offset)
  const references = await getReferencesFromTsResult2(tsResult, fs, (uri) => Rpc.invoke('FileSystem.readFile', uri))
  return references
}

// TODO ensure offset based api, makes things easier
export const provideReferences2 = async ({ position, uri }) => {
  const { fs, languageService } = getOrCreateLanguageService(uri)
  const text = await Rpc.invoke('FileSystem.readFile', uri)
  fs.writeFile(uri, text)
  const offset = getOffset(text, position.rowIndex, position.columnIndex)
  const tsResult = languageService.getReferencesAtPosition(uri, offset)
  const references = await getReferencesFromTsResult2(tsResult, fs, (uri) => Rpc.invoke('FileSystem.readFile', uri))
  return references
}

export const provideFileReferences = async (textDocument: any) => {
  const tsResult = await FileReferences.getFileReferences(textDocument)
  const fileReferences = tsResult
  return fileReferences
}
