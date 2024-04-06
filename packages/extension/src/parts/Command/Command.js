const rpcInvoke = (...params) => {
  console.log({ params })
  // TypeScriptRpc.invoke
}

const getFn = (method) => {
  switch (method) {
    case 'TypeScriptRpc.invoke':
      return rpcInvoke
    default:
      throw new Error('method not found')
  }
}

export const execute = (method, ...params) => {
  const fn = getFn(method)
  return fn(...params)
}
