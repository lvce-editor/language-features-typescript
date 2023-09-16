export const state = {
  /**
   * @type {any}
   */
  session: undefined,
}

export const set = (value) => {
  state.session = value
}

/**
 *
 * @returns {import('typescript/lib/tsserverlibrary.js').server.Session}
 */
export const get = () => {
  return state.session
}
