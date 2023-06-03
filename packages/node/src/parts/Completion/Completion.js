import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'

/**
 * @type {vscode.CompletionProvider['provideCompletions']}
 */
export const getCompletion = async (params) => {
  const tsResult = await TsServerRequests.completionInfo(params)
  return tsResult
}
