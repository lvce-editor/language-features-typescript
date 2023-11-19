import * as GetRpcNode from '../GetRpcNode/GetRpcNode.js'
import * as GetRpcWeb from '../GetRpcWeb/GetRpcWeb.js'
import * as IsWeb from '../IsWeb/IsWeb.js'

export const getRpc = (path) => {
  const module = IsWeb.isWeb ? GetRpcWeb : GetRpcNode
  return module.getRpc(path)
}
