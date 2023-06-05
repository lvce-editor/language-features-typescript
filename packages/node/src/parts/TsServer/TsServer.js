// TODO should be xdg and windows compatible and only start when necessary and be in a different file (Logger.js)

// TODO tsserver path should be overridable via configuration

const getServerFactory = (ipc) => {
  switch (ipc) {
    case 'stdio':
      return import('../TsServerIpcParentWithNodeSpawnedProcess/TsServerIpcParentWithNodeSpawnedProcess.js')
    case 'node-ipc':
      return import('../TsServerIpcParentWithNodeForkedProcess/TsServerIpcParentWithNodeForkedProcess.js')
    default:
      throw new Error('unexpected ipc type')
  }
}

export const create = async ({
  tsServerPath = '',
  argv,
  execArgv,
  ipc = 'node-ipc',
  handleMessage = () => {},
  handleError = () => {},
  handleExit = () => {},
} = {}) => {
  const factory = await getServerFactory(ipc)
  const rawInstance = await factory.create({
    path: tsServerPath,
    argv,
    execArgv,
  })
  const instance = factory.wrap(rawInstance)
  instance.onError(handleError)
  instance.onMessage(handleMessage)
  instance.onExit(handleExit)
  return instance
}
