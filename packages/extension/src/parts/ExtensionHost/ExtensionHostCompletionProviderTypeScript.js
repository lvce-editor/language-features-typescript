import * as Completion from '../Completion/Completion.js'
import * as GetCompletionFromTsResult from '../GetCompletionFromTsResult/GetCompletionFromTsResult.js'
import * as GetResolveCompletionItemFromTsResult from '../GetResolvedCompletionItemFromTsResult/GetResolvedCompletionItemFromTsResult.js'
import * as ResolveCompletion from '../ResolveCompletion/ResolveCompletion.js'

/**
 * @type {vscode.CompletionProvider['provideCompletions']}
 */
export const provideCompletions = async (textDocument, offset) => {
  const tsResult = await Completion.getCompletion(textDocument, offset)
  const items = GetCompletionFromTsResult.getCompletionFromTsResult(tsResult)
  return items
}

// /**
//  * @type {vscode.CompletionProvider['resolveCompletionItem']}
//  */
export const resolveCompletionItem = async (textDocument, offset, name, completionItem) => {
  const tsResult = await ResolveCompletion.resolveCompletion(textDocument, offset, name, completionItem)
  const result = GetResolveCompletionItemFromTsResult.getResolveCompletionItemFromTsResult(tsResult)
  return result
}
