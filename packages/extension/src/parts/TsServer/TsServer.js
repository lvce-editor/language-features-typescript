import * as ChildProcess from '../ChildProcess/ChildProcess.js'
import * as TsServerWithIpc from './TsServerWithIpc.js'
import * as TsServerWithStdio from './TsServerWithStdio.js'

// TODO should be xdg and windows compatible and only start when necessary and be in a different file (Logger.js)

// TODO tsserver path should be overridable via configuration

const getServerFactory = (ipc) => {
  switch (ipc) {
    case 'stdio':
      return TsServerWithStdio
    case 'node-ipc':
      return TsServerWithIpc
    default:
      throw new Error('unexpected ipc type')
  }
}

export const create = ({
  disableAutomaticTypingAcquisition = true,
  npmLocation = undefined,
  tsServerPath = '',
  ipc = 'stdio',
  handleMessage = () => {},
  handleError = () => {},
  handleExit = () => {},
} = {}) => {
  const args = ['--max-old-space-size=200', tsServerPath]
  args.push('--useInferredProjectPerProjectRoot')
  if (disableAutomaticTypingAcquisition) {
    args.push('--disableAutomaticTypingAcquisition')
  }
  if (npmLocation) {
    args.push('--npmLocation', `${npmLocation}`)
  }
  args.push('--locale', 'en')
  args.push('--noGetErrOnBackgroundUpdate')
  args.push('--validateDefaultNpmLocation')
  args.push('--suppressDiagnosticEvents')

  const factory = getServerFactory(ipc)

  const instance = factory.create({
    args,
  })
  instance.onError(handleError)
  instance.onMessage(handleMessage)
  instance.onExit(handleExit)
  return instance
}
