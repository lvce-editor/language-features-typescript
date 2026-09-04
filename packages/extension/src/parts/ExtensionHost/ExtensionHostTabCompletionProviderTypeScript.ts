// @ts-nocheck
import * as Completion from '../Completion/Completion.ts'
import * as GetTabCompletionFromTsResult from '../GetTabCompletionFromTsResult/GetTabCompletionFromTsResult.ts'
import * as LanguageId from '../LanguageId/LanguageId.ts'

export const languageId = LanguageId.TypeScript

const isWordCharacter = (character: string): boolean => {
  return /[\dA-Za-z-]/.test(character)
}

const getWord = (text: string, offset: number): string => {
  let start = offset
  while (start > 0 && isWordCharacter(text[start - 1])) {
    start--
  }
  return text.slice(start, offset)
}

/**
 * @type {vscode.CompletionProvider['provideCompletions']}
 */
export const provideTabCompletion = async (textDocument: any, offset: number): Promise<any> => {
  const { text } = textDocument
  const word = getWord(text, offset)
  if (!word) {
    return undefined
  }
  if (word === 'con') {
    return {
      deleted: 3,
      inserted: 'console',
      offset: offset - 3,
      type: /* Snippet */ 2,
    }
  }
  if (word === 'cons') {
    return {
      deleted: 4,
      inserted: 'console',
      offset: offset - 4,
      type: /* Snippet */ 2,
    }
  }
  const tsResult = await Completion.getCompletion(textDocument, offset)
  const tabCompletion = GetTabCompletionFromTsResult.getTabCompletionFromTsResult(tsResult, offset, word)
  return tabCompletion
}
