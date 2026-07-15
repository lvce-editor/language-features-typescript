interface TextDocument {
  readonly text: string
}

interface Position {
  readonly columnIndex: number
  readonly rowIndex: number
}

export const getOffset = (textDocument: TextDocument, position: Position): number => {
  let offset = 0
  let rowIndex = 0
  while (rowIndex++ < position.rowIndex) {
    offset = textDocument.text.indexOf('\n', offset) + 1
  }
  return offset + position.columnIndex
}

export const getPosition = (textDocument: TextDocument, offset: number): Position => {
  let index = 0
  let rowIndex = 0
  while (index < offset) {
    const newLineIndex = textDocument.text.indexOf('\n', index)
    if (newLineIndex === -1 || newLineIndex + 1 > offset) {
      break
    }
    index = newLineIndex + 1
    rowIndex++
  }
  return {
    columnIndex: offset - index,
    rowIndex,
  }
}
