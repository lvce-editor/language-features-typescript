import * as CompletionItemFlags from '../CompletionItemFlags/CompletionItemFlags.ts'

export const convertTsCompletionKindModifiers = (modifier: string): number => {
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
