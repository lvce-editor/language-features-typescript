import * as LanguageId from '../LanguageId/LanguageId.ts'

export const languageId = LanguageId.TypeScript

export const provideComments = async (textDocument: any, offset: number): Promise<any> => {
  console.log({ textDocument, offset })
  return []
}
