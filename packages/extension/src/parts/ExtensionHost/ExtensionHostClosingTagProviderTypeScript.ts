// @ts-nocheck
import * as TsServerRequests from '../TsServerRequests/TsServerRequests.ts'
import * as Position from '../Position/Position.ts'

export const languageId = 'typescript'

/**
 * @param {import('typescript/lib/protocol').TextInsertion} tsResult
 * @returns {any}
 */
const getClosingTagFromTsResult = (tsResult) => {
  return undefined
}

export const triggerCharacters = ['/']

/**
 * @type {vscode.ClosingTagProvider['provideClosingTag']}
 */
export const provideClosingTag = async (textDocument, offset) => {
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const tsResult = await TsServerRequests.jsxClosingTag({
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  const closingTagResult = getClosingTagFromTsResult(tsResult)
  return closingTagResult
}
