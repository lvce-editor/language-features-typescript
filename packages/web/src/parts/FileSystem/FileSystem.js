import * as IsLibFile from '../IsLibFile/IsLibFile.js'
import * as ReadLibFile from '../ReadLibFile/ReadLibFile.js'

export const state = {
  files: Object.create(null),
  version: 1,
}

export const readFile = (uri) => {
  if (IsLibFile.isLibFile(uri)) {
    return ReadLibFile.readLibFile(uri)
  }
  return state.files[uri]
}

export const writeFile = (uri, text) => {
  state.files[uri] = text
  state.version++
}

export const getVersion = () => {
  return state.version
}

export const getAllFiles = () => {
  return Object.keys(state.files)
}

export const readVersion = (fileName) => {
  return '1'
}
