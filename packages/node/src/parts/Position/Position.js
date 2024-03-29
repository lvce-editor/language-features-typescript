// @ts-nocheck
// TODO this should not be in core

export const getTsPosition = (textDocument, offset) => {
  return {
    line: 1,
    offset: 1,
  }
}

export const getOffset = (textDocument, tsPosition) => {
  const position = {
    rowIndex: tsPosition.line - 1,
    columnIndex: tsPosition.offset - 1,
  }
  // @ts-ignore
  const offset = vscode.getOffset(textDocument, position)
  return offset
}

/**
 *
 * @param {import('typescript/lib/protocol').Location} tsPosition
 * @returns
 */
export const getRowIndex = (tsPosition) => {
  return tsPosition.line - 1
}
