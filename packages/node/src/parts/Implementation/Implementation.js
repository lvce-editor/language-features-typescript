import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'

export const getImplementations = async (params) => {
  const tsResult = await TsServerRequests.implementation(params)
  return tsResult
}
