import * as LanguageId from '../LanguageId/LanguageId.js'
import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.js'

export const languageId = LanguageId.TypeScript

export const getPrepareRenameFromTsResult = (tsResult) => {}

export const prepareRename = async (textDocument, offset) => {
  //  TODO
}

export const provideRename = async (textDocument, offset, newName) => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('Rename.rename', textDocument, offset, newName)
}
