// @ts-nocheck
import { performance } from 'node:perf_hooks'
import * as LanguageId from '../LanguageId/LanguageId.ts'
import * as TsServerRequests from '../TsServerRequests/TsServerRequests.ts'

export const languageId = LanguageId.TypeScript

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
