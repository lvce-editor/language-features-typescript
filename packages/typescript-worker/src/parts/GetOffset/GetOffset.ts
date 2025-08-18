export const getOffset = (text: string, rowIndex: number, columnIndex: number): number => {
  const lines = text.split('\n')
  let offset = 0

  // Add lengths of all lines before the target row
  for (let i = 0; i < rowIndex; i++) {
    offset += lines[i].length + 1 // +1 for the newline character
  }

  // Add the column index for the target row
  offset += columnIndex

  return offset
}
