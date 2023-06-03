import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'

export const getTypeDefinition = async (params) => {
  const tsResult = await TsServerRequests.typeDefinition(params)
  return tsResult
}
