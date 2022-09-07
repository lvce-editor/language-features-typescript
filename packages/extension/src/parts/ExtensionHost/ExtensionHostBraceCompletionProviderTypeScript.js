import * as TsServerRequests from 'ts-server-requests'
import * as Position from '../Position/Position.js'
import * as TsPrimaryServer from '../TsPrimaryServer/TsPrimaryServer.js'

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
  const server = TsPrimaryServer.getInstance()
  const shouldDoBraceCompletion = await TsServerRequests.braceCompletion(
    server,
    {
      file: textDocument.uri,
      openingBrace,
      line: tsPosition.line,
      offset: tsPosition.offset,
    }
  )
  return shouldDoBraceCompletion
}
