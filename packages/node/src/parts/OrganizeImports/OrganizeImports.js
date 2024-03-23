import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'

/**
 * @type {any}
 */
export const organizeImports = async (params) => {
  const tsResult = await TsServerRequests.organizeImports(params)
  return tsResult
}
