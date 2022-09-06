import * as TsServerIpcType from '../TsServerIpcType/TsServerIpcType.js'
import * as TsServerWithIpc from './TsServerWithIpc.js'
import * as TsServerWithStdio from './TsServerWithStdio.js'

// TODO should be xdg and windows compatible and only start when necessary and be in a different file (Logger.js)

// TODO tsserver path should be overridable via configuration

const TS_SERVER_MAX_MEMORY = 200

/**
 *
 * @param {string} ipc
 * @returns
 */
const getServerFactory = (ipc) => {
  switch (ipc) {
    case TsServerIpcType.Stdio:
      return TsServerWithStdio
    case TsServerIpcType.NodeIpc:
      return TsServerWithIpc
    default:
      throw new Error('unexpected ipc type')
  }
}

export const create = ({
  disableAutomaticTypingAcquisition = true,
  npmLocation = '',
  tsServerPath = '',
  ipc = TsServerIpcType.NodeIpc,
  handleMessage = () => {},
  handleError = () => {},
  handleExit = () => {},
} = {}) => {
  const args = [`--max-old-space-size=${TS_SERVER_MAX_MEMORY}`, tsServerPath]
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
