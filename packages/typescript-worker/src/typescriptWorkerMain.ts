import { WebWorkerRpcClient } from '@lvce-editor/rpc'
import { commandMap } from './parts/Ts7Worker/Ts7Worker.ts'

export { commandMap } from './parts/Ts7Worker/Ts7Worker.ts'

if (!globalThis.rpc) {
  // eslint-disable-next-line unicorn/no-global-object-property-assignment
  globalThis.rpc = await WebWorkerRpcClient.create({
    commandMap,
  })
}
