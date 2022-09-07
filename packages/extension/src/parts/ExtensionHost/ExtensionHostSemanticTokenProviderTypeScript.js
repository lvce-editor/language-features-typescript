import { performance } from 'node:perf_hooks'
import * as TsServerRequests from 'ts-server-requests'

export const languageId = 'typescript'

/**
 * @param {import('typescript/lib/protocol').EncodedSemanticClassificationsResponse['body']} tsResult
 * @returns {readonly number[]}
 */
export const getSemanticTokensFromTsResult = (tsResult) => {
  if (!tsResult) {
    return []
  }
  return tsResult.spans
}

/**
 * @type{vscode.SemanticTokenProvider['provideSemanticTokens']}
 */
export const provideSemanticTokens = async (textDocument) => {
  const text = vscode.getTextFromTextDocument(textDocument)
  console.log('start-semantic-tokens', performance.now())
  const tsResult = await TsServerRequests.encodedSemanticClassificationsFull({
    file: textDocument.uri,
    start: 0,
    length: text.length,
    format: '2020',
  })
  console.log('finished-semantic-tokens', performance.now())
  return getSemanticTokensFromTsResult(tsResult)
}
