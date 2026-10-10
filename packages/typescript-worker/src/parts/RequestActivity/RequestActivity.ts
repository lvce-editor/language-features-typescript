const state = { active: 0, revision: 0 }
const retired = new Set<() => void>()

export const getRevision = (): number => state.revision
export const isActive = (): boolean => state.active > 0

export const retire = (dispose: () => void): void => {
  if (state.active) retired.add(dispose)
  else dispose()
}

// Hold the lease through asynchronous conversion and cross-file reads too.
export const wrapRequest =
  (fn: (...args: any[]) => any) =>
  async (...args: any[]): Promise<any> => {
    state.active++
    state.revision++
    try {
      return await fn(...args)
    } finally {
      state.active--
      if (!state.active) {
        for (const dispose of retired) dispose()
        retired.clear()
      }
    }
  }
