// @ts-nocheck
import * as Position from '../Position/Position.ts'
import * as TsServerRequests from '../TsServerRequests/TsServerRequests.ts'

export const languageId = 'typescript'

/**
 * @type {vscode.BraceCompletionProvider['provideBraceCompletion']}
 */
export const provideBraceCompletion = async (textDocument: any, offset: number, openingBrace: string): Promise<any> => {
  console.warn('typescript brace completion', textDocument)
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const shouldDoBraceCompletion = await TsServerRequests.braceCompletion({
    file: textDocument.uri,
    openingBrace,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  return shouldDoBraceCompletion
}
