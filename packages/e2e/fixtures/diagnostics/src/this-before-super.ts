export const fixture = true

class Base {}

class Derived extends Base {
  value = 1

  constructor() {
    this.value = 2
    super()
  }
}

export const derived = Derived
