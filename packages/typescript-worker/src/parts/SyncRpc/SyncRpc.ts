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
  readonly getCacheStatistics?: () => FileCacheStatistics
  readonly getChangedFiles?: () => readonly string[] | undefined
  readonly invokeSync: (method: string, ...params: readonly any[]) => any
  readonly refresh?: () => boolean
}
