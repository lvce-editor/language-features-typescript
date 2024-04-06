import * as CompletionItemFlags from '../CompletionItemFlags/CompletionItemFlags.ts'

/**
 * @param {string} modifier
 */
export const convertTsCompletionKindModifiers = (modifier) => {
  const parts = modifier.split(',')
  let flag = CompletionItemFlags.None
  for (const part of parts) {
    switch (part) {
      case 'deprecated':
        flag |= CompletionItemFlags.Deprecated
        break
      default:
        break
    }
  }
  return flag
}
