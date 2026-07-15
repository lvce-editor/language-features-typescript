import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.ts'

/**
 * @type {vscode.BraceCompletionProvider['provideBraceCompletion']}
 */
export const provideBraceCompletion = async (textDocument: any, offset: number, openingBrace: string): Promise<any> => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('BraceCompletion.provide', textDocument, offset, openingBrace)
}
