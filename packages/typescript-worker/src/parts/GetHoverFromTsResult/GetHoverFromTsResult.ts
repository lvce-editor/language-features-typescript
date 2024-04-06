export const getHoverFromTsResult = (tsResult: any) => {
  if (!tsResult) {
    return undefined
  }
  return {
    displayString: tsResult.displayString,
    documentation: tsResult.documentation,
    languageId: 'typescript',
  }
}
