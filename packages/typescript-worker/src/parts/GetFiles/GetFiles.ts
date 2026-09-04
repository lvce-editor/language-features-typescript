import { isTypeScriptFile } from '../IsTypeScriptFile/IsTypeScriptFile.ts'

const defaultExcludedDirectories = new Set(['bower_components', 'jspm_packages', 'node_modules'])

const getSearchRoot = (pattern: string): string => {
  const normalizedPattern = pattern
    .replaceAll('\\', '/')
    .replace(/^\.?\//, '')
    .replace(/\/$/, '')
  const wildcardIndex = normalizedPattern.search(/[*?]/)
  if (wildcardIndex === -1) {
    return isTypeScriptFile(normalizedPattern) ? '' : normalizedPattern
  }
  const slashIndex = normalizedPattern.lastIndexOf('/', wildcardIndex)
  return slashIndex === -1 ? '' : normalizedPattern.slice(0, slashIndex)
}

export const getFiles = (
  basePath: string,
  include: readonly string[] | undefined,
  readDir: (uri: string) => readonly string[],
): readonly string[] => {
  if (include?.length === 0) {
    return []
  }
  const files: string[] = []
  const visitedDirectories = new Set<string>()
  const visit = (directoryPath: string): void => {
    if (visitedDirectories.has(directoryPath)) {
      return
    }
    visitedDirectories.add(directoryPath)
    let dirents: readonly string[]
    try {
      dirents = readDir(directoryPath)
    } catch {
      return
    }
    for (const dirent of dirents) {
      const childPath = `${directoryPath}/${dirent}`
      if (isTypeScriptFile(childPath)) {
        files.push(childPath)
        continue
      }
      if (dirent.includes('.') || defaultExcludedDirectories.has(dirent)) {
        continue
      }
      visit(childPath)
    }
  }

  const searchRoots = include ? [...new Set(include.map(getSearchRoot))] : ['']
  for (const searchRoot of searchRoots) {
    const searchPath = searchRoot ? `${basePath}/${searchRoot}` : basePath
    if (isTypeScriptFile(searchPath)) {
      files.push(searchPath)
    } else {
      visit(searchPath)
    }
  }
  return [...new Set(files)]
}
