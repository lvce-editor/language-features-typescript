import { ExtensionManagementWorker } from '@lvce-editor/rpc-registry'

await ExtensionManagementWorker.invoke('Extensions.disableWorkspace', 42)
