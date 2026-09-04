export const fixture = true

function format(value: string): string
function format(value: number): number {
  return value
}

export const result = format('value')
