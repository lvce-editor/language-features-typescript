export const state = {
  /**
   * @type {any}
   */
  languageService: undefined,
}

export const set = (value) => {
  state.languageService = value
}

export const get = () => {
  return state.languageService
}
