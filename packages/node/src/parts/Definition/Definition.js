import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'

export const getDefinition = async (params) => {
  const tsResult = await TsServerRequests.definition(params)
  return tsResult
}
