export interface FileCacheStatistics {
  readonly dependenciesEnabled: boolean
  readonly dependencyHits: number
  readonly generalEnabled: boolean
  readonly generalHits: number
  readonly identitiesChecked: number
  readonly identityRequests: number
  readonly sourceReads: number
}

export interface SyncRpc {
  readonly dispose?: () => void
  readonly getCacheStatistics?: () => FileCacheStatistics
  readonly invokeSync: (method: string, ...params: readonly any[]) => any
  readonly refresh?: () => boolean
}
