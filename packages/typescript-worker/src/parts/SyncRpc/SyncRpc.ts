export interface SyncRpc {
  readonly invokeSync: (method: string, ...params: readonly any[]) => any
}
