export const state = {
  files: Object.create(null),
}

export const readFile = (uri) => {
  return state.files[uri]
}

export const writeFile = (uri, text) => {
  state.files[uri] = text
}

export const version = 1

export const getAllFiles = () => {
  return Object.keys(state.files)
}

export const readVersion = (fileName) => {
  return '1'
}
