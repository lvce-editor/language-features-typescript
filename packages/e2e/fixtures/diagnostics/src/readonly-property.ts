export const fixture = true

interface User {
  readonly id: number
}

const user: User = { id: 1 }
user.id = 2
