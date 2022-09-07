import * as TsServerRequests from 'ts-server-requests'
import * as Position from '../Position/Position.js'

export const languageId = 'typescript'

const getHoverFromTsResult = (tsResult) => {
  return undefined
}

/**
 * @type {vscode.HoverProvider['provideHover']}
 */
export const provideHover = async (textDocument, offset) => {
  const tsPosition = Position.getTsPosition(textDocument, offset)
  // TODO should call hover method
  const tsResult = await TsServerRequests.completionInfo({
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  return getHoverFromTsResult(tsResult)
}
