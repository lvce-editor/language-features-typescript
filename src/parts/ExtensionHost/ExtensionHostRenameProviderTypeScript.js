import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'
import * as Position from '../Position/Position.js'

export const languageId = 'typescript'

/**
 * @param {import('typescript/lib/protocol').RenameResponseBody} tsResult
 * @returns {vscode.PrepareRenameInfo} // TODO rename this to PrepareRenameResult
 */
export const getPrepareRenameFromTsResult = (tsResult) => {
  return {
    canRename: tsResult.info.canRename,
  }
}

/**
 * @type{vscode.RenameProvider['prepareRename']}
 */
export const prepareRename = async (textDocument, offset) => {
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const tsResult = await TsServerRequests.rename({
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  return getPrepareRenameFromTsResult(tsResult)
}

/**
 * @param {import('typescript/lib/protocol').RenameResponseBody} tsResult
 * @param {string} newName
 * @returns {readonly vscode.WorkspaceEdit[]}
 */
export const getRenameResultFromTsResult = (
  textDocument,
  tsResult,
  newName
) => {
  if (!tsResult.info.canRename) {
    // TODO how to handle this kind of error vs programmer error?
    throw new Error('rename was not successful')
  }
  const workspaceEdits = []
  for (const spanGroup of tsResult.locs) {
    const edits = []
    for (const textSpan of spanGroup.locs) {
      const prefixText = textSpan.prefixText || ''
      const suffixText = textSpan.suffixText || ''
      const inserted = prefixText + newName + suffixText
      const offset = Position.getOffset(textDocument, textSpan.start)
      console.log({ offset })
      edits.push({
        offset,
        inserted,
        deleted: 0,
      })
    }
    workspaceEdits.push({
      file: spanGroup.file,
      edits,
    })
  }
  return workspaceEdits
}

/**
 * @type{vscode.RenameProvider['rename']}
 */
export const rename = async (textDocument, offset, newName) => {
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const tsResult = await TsServerRequests.rename({
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  return getRenameResultFromTsResult(textDocument, tsResult, newName)
}
