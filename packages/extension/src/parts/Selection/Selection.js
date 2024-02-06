import * as Rpc from '../Rpc/Rpc.js'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.js'

export const expandSelection = async (textDocument, positions) => {
  await TextDocumentSync.openTextDocuments([textDocument])
  const rowIndex = positions[0]
  const columnIndex = positions[1]
  const tsResult = await Rpc.invoke('Selection.expandSelection', {
    file: textDocument.uri,
    locations: {
      line: rowIndex + 1,
      offset: columnIndex + 1,
    },
  })
  console.log({ tsResult, positions })
  return tsResult
}
