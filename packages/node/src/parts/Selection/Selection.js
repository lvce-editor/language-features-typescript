import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'

export const expandSelection = async (params) => {
  const tsResult = await TsServerRequests.selectionRange(params)
  console.log({ params, tsResult })
  return tsResult
}
