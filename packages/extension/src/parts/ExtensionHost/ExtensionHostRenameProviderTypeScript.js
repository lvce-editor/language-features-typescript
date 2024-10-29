import * as Position from '../Position/Position.js'
import * as LanguageId from '../LanguageId/LanguageId.js'
import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.js'

export const languageId = LanguageId.TypeScript

export const getPrepareRenameFromTsResult = (tsResult) => {}

export const prepareRename = async (textDocument, offset) => {
  //  TODO
}

export const getRenameResultFromTsResult = (textDocument, tsResult, newName) => {
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

export const rename = async (textDocument, offset, newName) => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('Rename.rename', textDocument, offset, newName)
}
