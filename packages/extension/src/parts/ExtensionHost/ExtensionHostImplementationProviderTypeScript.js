import * as TsServerRequests from 'ts-server-requests'
import * as Position from '../Position/Position.js'
import { readFileSync } from 'node:fs'

export const languageId = 'typescript'

/**
 *
 * @param {vscode.TextDocument} textDocument
 * @param {import('typescript/lib/protocol').ImplementationResponse['body']} tsResult
 * @returns {readonly vscode.Location[]}
 */
const getImplementationsFromTsResult = (textDocument, tsResult) => {
  if (!tsResult) {
    return []
  }
  /**
   * @type {vscode.Location[]}
   */
  const implementations = []
  for (const span of tsResult) {
    // TODO handle error when readfile sync fails
    const file = readFileSync(span.file, 'utf-8') // TODO this is very inefficient, especially for large files / many implementations
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

/**
 * @type{vscode.ImplementationProvider['provideImplementations']}
 */
export const provideImplementations = async (textDocument, offset) => {
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const tsResult = await TsServerRequests.implementation({
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  const implementations = getImplementationsFromTsResult(textDocument, tsResult)
  return implementations
}
