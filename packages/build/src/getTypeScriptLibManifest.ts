import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { NOT_NEEDED } from './removeUnusedTypeScriptFIles.ts'

export interface TypeScriptLibManifest {
  files: Array<{
    fileName: string
    sha256: string
    byteLength: number
  }>
  hash: string
  totalByteLength: number
}

export const getTypeScriptLibManifest = async (libDirectory: string): Promise<TypeScriptLibManifest> => {
  const entries = await readdir(libDirectory, { withFileTypes: true })
  const fileNames = entries
    .filter(
      (entry) =>
        entry.isFile() && /^lib(?:\..+)?\.d\.ts$/.test(entry.name) && !NOT_NEEDED.includes(`lib/${entry.name}`),
    )
    .map((entry) => entry.name)
    .sort()

  const files = await Promise.all(
    fileNames.map(async (fileName) => {
      const content = await readFile(join(libDirectory, fileName))
      return {
        fileName,
        sha256: createHash('sha256').update(content).digest('hex'),
        byteLength: content.byteLength,
      }
    }),
  )
  const hash = createHash('sha256')
    .update(files.map(({ fileName, sha256, byteLength }) => `${fileName}\0${byteLength}\0${sha256}`).join('\n'))
    .digest('hex')

  return {
    files,
    hash,
    totalByteLength: files.reduce((total, file) => total + file.byteLength, 0),
  }
}
