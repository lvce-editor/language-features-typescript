import * as LanguageServiceCompletion from '../LanguageServiceCompletion/LanguageServiceCompletion.js'

export const getCompletion = (params) => {
  return LanguageServiceCompletion.getCompletion(params)
}
