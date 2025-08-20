import { getParentPath } from '../GetParentPath/GetParentPath.ts'

export const getConfigPath = (uri: string, configFileName: string, exists: (uri: string) => boolean): string => {
  const parentPath = getParentPath(uri)
  if (!parentPath) {
    return ''
  }
  const possibleTsConfigPath = `${parentPath}/${configFileName}`
  if (exists(possibleTsConfigPath)) {
    return possibleTsConfigPath
  }
  return getConfigPath(parentPath, configFileName, exists)
}
