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
  readonly clearReferences?: () => void
  readonly dispose?: () => void
  readonly forgetReferences?: (uris: readonly string[]) => void
  readonly getChangedFiles?: () => readonly string[] | undefined
  readonly getCacheStatistics?: () => FileCacheStatistics
  readonly invokeSync: (method: string, ...params: readonly any[]) => any
  readonly refresh?: () => boolean
}
