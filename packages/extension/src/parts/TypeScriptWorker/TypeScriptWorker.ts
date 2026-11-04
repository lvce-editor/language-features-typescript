import * as LaunchTypeScriptWorker from '../LaunchTypeScriptWorker/LaunchTypeScriptWorker.ts'

export const state = {
  ipc: undefined,
  launchTypeScriptWorker: LaunchTypeScriptWorker.launchTypeScriptWorker,
  rpcPromise: undefined,
}

const launch = async () => {
  try {
    return await state.launchTypeScriptWorker()
  } catch (error) {
    state.rpcPromise = undefined
    throw error
  }
}

const getOrCreateRpc = async () => {
  state.rpcPromise ??= launch()
  return state.rpcPromise
}

export const getInstance = async () => {
  const rpc = await getOrCreateRpc()
  return rpc
}

export const dispose = async (): Promise<void> => {
  if (!state.rpcPromise) return
  const pending = state.rpcPromise
  state.rpcPromise = undefined
  const rpc = await pending
  try {
    await rpc.invoke('Ts7.dispose')
  } finally {
    rpc.dispose?.()
  }
}
