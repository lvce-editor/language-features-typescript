// TODO this should not be in core

export const getTsPosition = (textDocument, offset) => {
  const position = vscode.getPosition(textDocument, offset)
  return {
    line: position.rowIndex + 1,
    offset: position.columnIndex + 1,
  }
}

export const getOffset = (textDocument, tsPosition) => {
  const position = {
    rowIndex: tsPosition.line - 1,
    columnIndex: tsPosition.offset - 1,
  }
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
