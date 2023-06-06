import * as Hover from '../Hover/Hover.js'
import * as LanguageId from '../LanguageId/LanguageId.js'

export const languageId = LanguageId.TypeScript

const getHoverFromTsResult = (tsResult) => {
  return {
    displayString: tsResult.displayString,
    documentation: tsResult.documentation,
    languageId: LanguageId.TypeScript,
  }
}

/**
 * @type {vscode.HoverProvider['provideHover']}
 */
export const provideHover = async (textDocument, offset) => {
  const tsResult = await Hover.getHover(textDocument, offset)
  return getHoverFromTsResult(tsResult)
}
