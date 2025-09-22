import * as LanguageId from '../LanguageId/LanguageId.ts'
import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.ts'

export const languageId = LanguageId.TypeScript

export const getPrepareRenameFromTsResult = (tsResult: any): void => {}

export const prepareRename = async (textDocument: any, offset: number): Promise<any> => {
  //  TODO
}

export const provideRename = async (textDocument: any, offset: number, newName: string): Promise<any> => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('Rename.rename', textDocument, offset, newName)
}
