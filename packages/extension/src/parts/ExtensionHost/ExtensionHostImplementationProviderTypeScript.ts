import { executeCommand } from '@lvce-editor/api'
import * as LanguageId from '../LanguageId/LanguageId.ts'
import { getOffset } from '../TextDocument/TextDocument.ts'
import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.ts'

export const languageId = LanguageId.TypeScript

export const provideImplementations = async (textDocument: any, offset: number): Promise<any> => {
  // Older hosts send their renderer's cached editor state for this provider.
  // Recover live text and cursor only while that same editor remains active.
  if (typeof textDocument.text !== 'string') {
    const [document, selections] = await Promise.all([
      executeCommand('GetActiveEditor.getTextDocument') as Promise<{ uri: string; text: string } | undefined>,
      executeCommand('GetActiveEditor.getSelections') as Promise<number[]>,
    ])
    const active = (await executeCommand('GetActiveEditor.getActiveEditorInfo')) as
      { id: number; uri: string } | undefined
    if (!document || document.uri !== textDocument.uri || active?.id !== textDocument.uid || selections.length < 4)
      throw new Error('The implementation request editor is no longer active')
    offset = getOffset(document, { columnIndex: selections[3], rowIndex: selections[2] })
    textDocument = document
  }
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('Implementation.getImplementations', textDocument, offset)
}
