export const state = {
  /**
   * @type {any}
   */
  languageService: undefined,
}

export const set = (value) => {
  state.languageService = value
}

/**
 *
 * @returns {import('typescript/lib/typescript.js').LanguageService}
 */
export const get = () => {
  return state.languageService
}
