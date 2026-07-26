import * as CompletionItemFlags from '../CompletionItemFlags/CompletionItemFlags.ts'

export const convertTsCompletionKindModifiers = (modifier: string): number => {
  const parts = modifier.split(',')
  if (parts.includes('deprecated')) {
    return CompletionItemFlags.Deprecated
  }
  return CompletionItemFlags.None
}
