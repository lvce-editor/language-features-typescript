import type { LanguageService } from 'typescript'
import { createTypeScriptLanguageService } from '../CreateTypeScriptLanguageService/CreateTypeScriptLanguageService.ts'
import * as LanguageServices from '../LanguageServices/LanguageServices.ts'
import { emptyTsconfig } from '../ParseTsconfig/ParseTsconfig.ts'

// TODO cache it in a hashmap, one uri is connected to one project id
// one project id is connected to one project

let cache: LanguageService | undefined = undefined

export const getOrCreateLanguageService = (uri: string) => {
  const id = 1
  const { fs, ts, client } = LanguageServices.get(id)
  if (!cache) {
    const languageService = createTypeScriptLanguageService(ts, fs, client, emptyTsconfig)
    cache = languageService
  }

  return {
    fs,
    languageService: cache,
  }
}
