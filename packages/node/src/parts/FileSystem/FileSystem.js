import * as NodeFs from 'node:fs/promises'

export const readFile = async (path) => {
  const content = await NodeFs.readFile(path, 'utf8')
  return content
}
