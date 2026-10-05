import { getOrCreateLanguageService } from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'
import { getReferencesFromTsResult2 } from '../GetReferencesFromTsResult2/GetReferencesFromTsResult2.ts'
import * as Rpc from '../Rpc/Rpc.ts'

export const getImplementations = async (textDocument: any, offset: number) => {
  const { fs, languageService } = getOrCreateLanguageService(textDocument.uri)
  fs.writeFile(textDocument.uri, textDocument.text)
  const tsResult = languageService.getImplementationAtPosition(textDocument.uri, offset)
  const implementations = await getReferencesFromTsResult2(tsResult, fs, (uri) =>
    Rpc.invoke('FileSystem.readFile', uri),
  )
  return Promise.all(
    implementations.map(async (implementation) => {
      const text = fs.readFile(implementation.uri) || (await Rpc.invoke('FileSystem.readFile', implementation.uri))
      const lineText = text.split('\n')[implementation.startRowIndex]
      return {
        ...implementation,
        endOffset:
          implementation.endRowIndex === implementation.startRowIndex ? implementation.endColumnIndex : lineText.length,
        lineText,
        startOffset: implementation.startColumnIndex,
      }
    }),
  )
}
