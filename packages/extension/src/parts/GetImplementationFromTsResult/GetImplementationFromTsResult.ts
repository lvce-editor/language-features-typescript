// @ts-nocheck
import * as Position from '../Position/Position.ts'
import * as Rpc from '../Rpc/Rpc.ts'

/**
 *
 * @param {vscode.TextDocument} textDocument
 * @param {import('typescript/lib/protocol').ImplementationResponse['body']} tsResult
 * @returns {Promise<readonly vscode.Location[]>}
 */
export const getImplementationsFromTsResult = async (textDocument, tsResult) => {
  if (!tsResult) {
    return []
  }
  /**
   * @type {vscode.Location[]}
   */
  const implementations = []
  for (const span of tsResult) {
    // TODO handle error when readfile sync fails
    const file = await Rpc.invoke('FileSystem.readFile', span.file) // TODO this is very inefficient, especially for large files / many implementations
    const lines = file.split('\n')
    const line = lines[Position.getRowIndex(span.start)]
    implementations.push({
      uri: span.file,
      startOffset: 0,
      endOffset: 0,
      // @ts-ignore
      lineText: line,
    })
  }
  return implementations
}
