export interface SyncRpc {
  readonly dispose?: () => void
  readonly invokeSync: (method: string, ...params: readonly any[]) => any
  readonly refresh?: () => boolean
}
