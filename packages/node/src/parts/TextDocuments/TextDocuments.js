export const state = {
  textDocuments: Object.create(null),
}

export const hasUri = (uri) => {
  return uri in state.textDocuments
}

export const setUri = (uri, content) => {
  state.textDocuments[uri] = {}
}
