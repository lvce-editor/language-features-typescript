import * as FileSystem from '../FileSystem/FileSystem.js'

export const updateOpen = (options) => {
  FileSystem.writeFile(options.uri, options.text)
}
