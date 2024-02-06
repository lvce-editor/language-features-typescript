import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'

/**
 * @type {vscode.CompletionProvider['provideCompletions']}
 */
export const expandSelection = async (params) => {
  const tsResult = await TsServerRequests.selectionRange(params)
  return tsResult
}
