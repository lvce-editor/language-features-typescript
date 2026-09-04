import { LazyTransferMessagePortRpcParent } from '@lvce-editor/rpc'
import { ExtensionManagementWorker } from '@lvce-editor/rpc-registry'
import * as Command from '../Command/Command.ts'

export const launchWorker = async ({ name, url }: { name: string; url: string }): Promise<any> => {
  const rpc = await LazyTransferMessagePortRpcParent.create({
    commandMap: Command.commandMap,
    send(port): Promise<void> {
      return ExtensionManagementWorker.invokeAndTransfer('Extensions.createWebViewWorkerRpc', { name }, port)
    },
  })
  await rpc.invoke('LoadFile.loadFile', url)
  return rpc
}
