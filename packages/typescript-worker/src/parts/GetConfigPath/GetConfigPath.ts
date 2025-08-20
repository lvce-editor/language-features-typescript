import { getParentPath } from '../GetParentPath/GetParentPath.ts'

export const getConfigPath = (uri: string, configFileName: string, exists: (uri: string) => boolean): string => {
  const parentPath = getParentPath(uri)
  const possibleTsConfigPath = `${parentPath}/${configFileName}`
  if (exists(possibleTsConfigPath)) {
    return possibleTsConfigPath
  }
  // TODO walk up until a tsconfig file is found
  // if none is found, return empty string

  return ''
}
