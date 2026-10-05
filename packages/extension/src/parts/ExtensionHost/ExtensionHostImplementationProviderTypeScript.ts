// @ts-nocheck
import * as LanguageId from '../LanguageId/LanguageId.ts'
import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.ts'

export const languageId = LanguageId.TypeScript

/**
 * @type{vscode.ImplementationProvider['provideImplementations']}
 */
export const provideImplementations = async (textDocument: any, offset: number): Promise<any> => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('Implementation.getImplementations', textDocument, offset)
}
