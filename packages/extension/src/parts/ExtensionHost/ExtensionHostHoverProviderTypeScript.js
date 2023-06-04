import * as Hover from '../Hover/Hover.js'

export const languageId = 'typescript'

const getHoverFromTsResult = (tsResult) => {
  return {
    displayString: tsResult.displayString,
    documentation: tsResult.documentation,
  }
}

/**
 * @type {vscode.HoverProvider['provideHover']}
 */
export const provideHover = async (textDocument, offset) => {
  const tsResult = await Hover.getHover(textDocument, offset)
  return getHoverFromTsResult(tsResult)
}
