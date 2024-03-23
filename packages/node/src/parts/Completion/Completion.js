import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'

/**
 * @type {any}
 */
export const getCompletion = async (params) => {
  const tsResult = await TsServerRequests.completionInfo(params)
  return tsResult
}
