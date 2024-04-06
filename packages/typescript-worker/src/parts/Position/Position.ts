import * as Rpc from '../Rpc/Rpc.ts'

// TODO this should not be in core

export const getTsPosition = async (textDocument, offset) => {
  const position = await Rpc.invoke('Position.getPosition', textDocument, offset)
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
  return Rpc.invoke('Position.getOffset', textDocument, position)
}

/**
 *
 * @param {import('typescript/lib/protocol').Location} tsPosition
 * @returns
 */
export const getRowIndex = (tsPosition) => {
  return tsPosition.line - 1
}
