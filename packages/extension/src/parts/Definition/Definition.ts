import * as Position from '../Position/Position.ts'
import * as Rpc from '../Rpc/Rpc.ts'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.ts'

export const getDefinition = async (textDocument, offset) => {
  await TextDocumentSync.openTextDocuments([textDocument])
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const tsResult = await Rpc.invoke('Definition.getDefinition', {
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  return tsResult
}
