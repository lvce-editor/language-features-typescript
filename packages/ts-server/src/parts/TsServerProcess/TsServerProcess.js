import * as TsServerIpcType from '../TsServerIpcType/TsServerIpcType.js'
import * as TsServerWithIpc from './TsServerWithIpc.js'
import * as TsServerWithStdio from './TsServerWithStdio.js'

// TODO should be xdg and windows compatible and only start when necessary and be in a different file (Logger.js)

// TODO tsserver path should be overridable via configuration

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
  tsServerPath = '',
  ipc = TsServerIpcType.NodeIpc,
  handleMessage = () => {},
  handleError = () => {},
  handleExit = () => {},
  maxMemory = 200,
  tsArgs = [],
} = {}) => {
  const args = [`--max-old-space-size=${maxMemory}`, tsServerPath, ...tsArgs]
  console.log({ args })
  const factory = getServerFactory(ipc)
  console.log(factory)
  const instance = factory.create({
    args,
  })
  instance.onError(handleError)
  instance.onMessage(handleMessage)
  instance.onExit(handleExit)
  return instance
}
