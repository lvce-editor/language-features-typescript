export const getPositionAt = (text: string, offset: number): { rowIndex: number; columnIndex: number } => {
  if (!text) {
    return { rowIndex: 0, columnIndex: 0 }
  }
  const lines = text.split('\n')
  let currentOffset = 0

  for (let rowIndex = 0; rowIndex < lines.length; rowIndex++) {
    const lineLength = lines[rowIndex].length
    const lineEndOffset = currentOffset + lineLength

    if (offset <= lineEndOffset) {
      const columnIndex = offset - currentOffset
      return { rowIndex, columnIndex }
    }

    currentOffset = lineEndOffset + 1 // +1 for the newline character
  }

  // If offset is beyond the text, return the last position
  const lastRowIndex = lines.length - 1
  const lastColumnIndex = lines[lastRowIndex]?.length || 0
  return { rowIndex: lastRowIndex, columnIndex: lastColumnIndex }
}
