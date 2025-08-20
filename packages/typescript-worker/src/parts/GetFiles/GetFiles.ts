import { isTypeScriptFile } from '../IsTypeScriptFile/IsTypeScriptFile.ts'

export const getFiles = (
  basePath: string,
  include: readonly string[],
  readDir: (uri: string) => readonly string[],
): readonly string[] => {
  const dirents = readDir(basePath)
  const childPaths = dirents.map((dirent) => `${basePath}/${dirent}`)
  const allPaths = [...childPaths]
  // TODO have a glob function for files
  for (const childPath of childPaths) {
    if (childPath.endsWith('/src')) {
      allPaths.push(...getFiles(childPath, include, readDir))
    }
  }
  const filteredPaths = allPaths.filter(isTypeScriptFile)
  return filteredPaths
}
