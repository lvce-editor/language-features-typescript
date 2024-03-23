// @ts-nocheck
import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'
import * as Position from '../Position/Position.js'

export const languageId = 'typescript'

/**
 * @type {vscode.BraceCompletionProvider['provideBraceCompletion']}
 */
export const provideBraceCompletion = async (
  textDocument,
  offset,
  openingBrace
) => {
  console.log('typescript brace completion', textDocument)
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const shouldDoBraceCompletion = await TsServerRequests.braceCompletion({
    file: textDocument.uri,
    openingBrace,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  return shouldDoBraceCompletion
}
