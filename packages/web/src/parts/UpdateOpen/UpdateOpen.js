import * as FileSystem from '../FileSystem/FileSystem.js'

export const updateOpen = (files) => {
  for (const file of files) {
    FileSystem.writeFile(file.uri, file.text)
  }
}
