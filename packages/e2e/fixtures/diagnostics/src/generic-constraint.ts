export const fixture = true

type NumericValue<T extends number> = {
  value: T
}

export const value: NumericValue<string> = { value: 'one' }
