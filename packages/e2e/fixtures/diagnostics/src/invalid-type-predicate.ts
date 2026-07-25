export const fixture = true

export function isText(value: number): value is string {
  return typeof value === 'string'
}
