import * as GetRpcWeb from '../GetRpcWeb/GetRpcWeb.js'

export const getRpc = (path) => {
  const module = GetRpcWeb
  return module.getRpc(path)
}
