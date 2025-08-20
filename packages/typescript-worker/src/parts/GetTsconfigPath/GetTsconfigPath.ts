import { getConfigPath } from '../GetConfigPath/GetConfigPath.ts'

export const getTsConfigPath = (uri: string, exists: (uri: string) => boolean): string => {
  return getConfigPath(uri, 'tsconfig.json', exists)
}
