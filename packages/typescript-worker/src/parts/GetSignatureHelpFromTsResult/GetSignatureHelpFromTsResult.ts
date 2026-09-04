import type ts from 'typescript'

const displayPartsToString = (parts: readonly ts.SymbolDisplayPart[]): string => {
  return parts.map((part) => part.text).join('')
}

export const getSignatureHelpFromTsResult = (result: ts.SignatureHelpItems | undefined) => {
  if (!result) {
    return undefined
  }
  return {
    activeParameter: result.argumentIndex,
    activeSignature: result.selectedItemIndex,
    signatures: result.items.map((item) => {
      const separator = displayPartsToString(item.separatorDisplayParts)
      const parameters = item.parameters.map((parameter) => ({
        documentation: displayPartsToString(parameter.documentation),
        label: displayPartsToString(parameter.displayParts),
      }))
      return {
        documentation: displayPartsToString(item.documentation),
        label:
          displayPartsToString(item.prefixDisplayParts) +
          parameters.map((parameter) => parameter.label).join(separator) +
          displayPartsToString(item.suffixDisplayParts),
        parameters,
      }
    }),
  }
}
