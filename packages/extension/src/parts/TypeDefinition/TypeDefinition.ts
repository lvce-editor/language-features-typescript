// @ts-nocheck
import * as Position from '../Position/Position.ts'
import * as Rpc from '../Rpc/Rpc.ts'

/**
 * @type{vscode.DefinitionProvider['provideDefinition']}
 */
export const getTypeDefinition = async (textDocument: any, offset: number): Promise<any> => {
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const tsResult = await Rpc.invoke('TypeDefinition.getTypeDefinition', {
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  return tsResult
}
