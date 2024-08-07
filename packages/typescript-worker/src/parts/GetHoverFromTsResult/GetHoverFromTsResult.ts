import type * as Protocol from '../TypeScriptProtocol/TypeScriptProtocol.ts'

export const getHoverFromTsResult = (tsResult: Protocol.QuickInfoResponseBody) => {
  if (!tsResult) {
    return undefined
  }
  return {
    displayString: tsResult.displayString,
    documentation: tsResult.documentation,
    languageId: 'typescript',
  }
}
