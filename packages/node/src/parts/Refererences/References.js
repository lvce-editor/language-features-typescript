import * as TsServerRequests from '../TsServerRequests/TsServerRequests.js'

export const getReferences = async (params) => {
  const tsResult = await TsServerRequests.references(params)
  return tsResult
}

export const getFileReferences = async (params) => {
  const tsResult = await TsServerRequests.fileReferences(params)
  return tsResult
}
