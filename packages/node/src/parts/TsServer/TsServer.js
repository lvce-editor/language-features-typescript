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
  disableAutomaticTypingAcquisition = true,
  npmLocation = undefined,
  tsServerPath = '',
  ipc = 'node-ipc',
  handleMessage = () => {},
  handleError = () => {},
  handleExit = () => {},
} = {}) => {
  const execArgv = ['--max-old-space-size=200']
  const argv = []
  argv.push('--useInferredProjectPerProjectRoot')
  if (disableAutomaticTypingAcquisition) {
    argv.push('--disableAutomaticTypingAcquisition')
  }
  if (npmLocation) {
    argv.push('--npmLocation', `${npmLocation}`)
  }
  argv.push('--locale', 'en')
  argv.push('--noGetErrOnBackgroundUpdate')
  argv.push('--validateDefaultNpmLocation')
  argv.push('--suppressDiagnosticEvents')

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
