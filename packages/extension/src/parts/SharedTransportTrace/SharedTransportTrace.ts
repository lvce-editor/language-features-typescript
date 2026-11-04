// [DEBUG-rename-transport] Bounded diagnostic history; remove after the CI timeout is understood.
const events: unknown[] = []
export const record = (event: string, details: unknown): void => {
  events.push({ event, details, time: performance.now() })
  if (events.length > 40) events.shift()
}
export const snapshot = (): unknown[] => events.slice()
