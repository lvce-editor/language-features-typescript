export const fixture = true

interface Named {
  name: string
}

export class User implements Named {
  name = 1
}
