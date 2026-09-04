import type { DocumentSymbol, DocumentSymbolTextDocument } from '@lvce-editor/api'
import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.ts'

export const provideDocumentSymbols = async (
  textDocument: DocumentSymbolTextDocument,
): Promise<readonly DocumentSymbol[]> => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('DocumentSymbols.getDocumentSymbols', textDocument)
}
