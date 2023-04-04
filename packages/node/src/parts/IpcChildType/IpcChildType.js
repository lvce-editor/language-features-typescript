import * as ParseCliArgs from '../ParseCliArgs/ParseCliArgs.js'

export const NodeWorker = 1
export const NodeForkedProcess = 2
export const ElectronUtilityProcess = 3
export const ElectronUtilityProcessMessagePort = 4

export const Auto = () => {
  const { argv } = process
  const parsedArgs = ParseCliArgs.parseCliArgs(argv.slice(2))
  const ipcType = parsedArgs['ipc-type']
  switch (ipcType) {
    case 'node-worker':
      return NodeWorker
    case 'node-forked-process':
      return NodeForkedProcess
    case 'electron-utility-process':
      return ElectronUtilityProcess
    case 'electron-utility-process-message-port':
      return ElectronUtilityProcessMessagePort
    default:
      throw new Error(`[typescript-process] unknown ipc type ${ipcType}`)
  }
}
