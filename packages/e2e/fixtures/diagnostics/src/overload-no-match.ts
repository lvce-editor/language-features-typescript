export const fixture = true

function format(value: string): string
function format(value: number): number
function format(value: string | number): string | number {
  return value
}

export const result = format(true)
