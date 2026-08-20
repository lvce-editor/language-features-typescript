import type ts from 'typescript'

const displayPartsToString = (parts: readonly ts.SymbolDisplayPart[] = []): string => {
  return parts.map((part) => part.text).join('')
}

export const getHoverFromTsResult2 = (tsResult: ts.QuickInfo | undefined) => {
  if (!tsResult) {
    return undefined
  }
  return {
    displayString: displayPartsToString(tsResult.displayParts),
    documentation: displayPartsToString(tsResult.documentation),
    languageId: 'typescript',
  }
}
