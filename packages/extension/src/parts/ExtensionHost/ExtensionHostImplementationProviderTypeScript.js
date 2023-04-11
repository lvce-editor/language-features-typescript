import * as GetImplementationFromTsResult from '../GetImplementationFromTsResult/GetImplementationFromTsResult.js'
import * as Implementation from '../Implementation/Implementation.js'

export const languageId = 'typescript'

/**
 * @type{vscode.ImplementationProvider['provideImplementations']}
 */
export const provideImplementations = async (textDocument, offset) => {
  const tsResult = await Implementation.getImplementations(textDocument, offset)
  const implementations =
    await GetImplementationFromTsResult.getImplementationsFromTsResult(
      textDocument,
      tsResult
    )
  return implementations
}
