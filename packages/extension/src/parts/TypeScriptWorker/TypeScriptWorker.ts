import * as LaunchTypeScriptWorker from '../LaunchTypeScriptWorker/LaunchTypeScriptWorker.ts'

export const state = {
  ipc: undefined,
  launchTypeScriptWorker: LaunchTypeScriptWorker.launchTypeScriptWorker,
  rpcPromise: undefined,
}

const getOrCreateRpc = async () => {
  if (!state.rpcPromise) {
    state.rpcPromise = state.launchTypeScriptWorker()
  }
  return state.rpcPromise
}

export const getInstance = async () => {
  const rpc = await getOrCreateRpc()
  return rpc
}
