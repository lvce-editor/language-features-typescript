export const fixture = true

export async function load(value = await Promise.resolve(1)): Promise<number> {
  return value
}
