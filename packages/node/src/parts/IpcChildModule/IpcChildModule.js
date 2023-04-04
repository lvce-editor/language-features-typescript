import * as IpcChildType from '../IpcChildType/IpcChildType.js'

export const getModule = (method) => {
  switch (method) {
    case IpcChildType.ElectronUtilityProcess:
      return import(
        '../IpcChildWithElectronUtilityProcess/IpcChildWithElectronUtilityProcess.js'
      )
    case IpcChildType.ElectronUtilityProcessMessagePort:
      return import(
        '../IpcChildWithElectronUtilityProcessMessagePort/IpcChildWithElectronUtilityProcessMessagePort.js'
      )
    default:
      throw new Error('unexpected ipc type')
  }
}
