import * as TypeScriptWorker from '../TypeScriptWorker/TypeScriptWorker.ts'
export const provideTypeDefinition = async (textDocument: any, offset: number): Promise<any> => {
  const worker = await TypeScriptWorker.getInstance()
  return worker.invoke('TypeDefinition.getTypeDefinition', textDocument, offset)
}
