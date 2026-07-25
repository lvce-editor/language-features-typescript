export const fixture = true

type Result = { value: string } | { error: Error }

export interface CachedResult extends Result {
  cached: boolean
}
