import type ts from 'typescript'

export const getHoverFromTsResult2 = (tsResult: ts.QuickInfo | undefined) => {
  if (!tsResult) {
    return undefined
  }
  const displayStringParts = tsResult.displayParts || []
  const displayString = displayStringParts.map((item) => item.text).join('')
  tsResult.textSpan
  return {
    displayString: displayString,
    documentation: tsResult.documentation,
    languageId: 'typescript',
  }
}
