import * as Assert from '../Assert/Assert.ts'
import * as Position from '../Position/Position.ts'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.ts'
import * as TypeScriptRpc from '../TypeScriptRpc/TypeScriptRpc.ts'

export const getHover = async (textDocument: any, offset: number) => {
  const uri = textDocument.uri
  Assert.string(uri)
  Assert.number(offset)
  await TextDocumentSync.openTextDocuments([textDocument])
  const tsPosition = await Position.getTsPosition(textDocument, offset)
  const tsResult = await TypeScriptRpc.invoke('Hover.getHover', {
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  console.log({ tsResult })
  return tsResult
}
