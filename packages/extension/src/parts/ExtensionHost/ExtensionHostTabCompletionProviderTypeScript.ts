// @ts-nocheck
import * as Completion from '../Completion/Completion.ts'
import * as GetTabCompletionFromTsResult from '../GetTabCompletionFromTsResult/GetTabCompletionFromTsResult.ts'
import * as LanguageId from '../LanguageId/LanguageId.ts'

export const languageId = LanguageId.TypeScript

const RE_WORD = /[a-zA-Z\d\-]+$/

/**
 * @type {vscode.CompletionProvider['provideCompletions']}
 */
export const provideTabCompletion = async (textDocument, offset) => {
  const text = vscode.getTextFromTextDocument(textDocument)
  const wordMatch = text.slice(0, offset).match(RE_WORD)
  if (!wordMatch) {
    return undefined
  }
  const word = wordMatch[0]
  if (word === 'con') {
    return {
      inserted: 'console',
      deleted: 3,
      offset: offset - 3,
      type: /* Snippet */ 2,
    }
  }
  if (word === 'cons') {
    return {
      inserted: 'console',
      deleted: 4,
      offset: offset - 4,
      type: /* Snippet */ 2,
    }
  }
  const tsResult = await Completion.getCompletion(textDocument, offset)
  const tabCompletion = GetTabCompletionFromTsResult.getTabCompletionFromTsResult(tsResult, offset, word)
  return tabCompletion
}
