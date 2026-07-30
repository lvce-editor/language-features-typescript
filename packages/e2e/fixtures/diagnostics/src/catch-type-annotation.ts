export const fixture = true

try {
  throw new Error('failure')
} catch (error: Error) {}
