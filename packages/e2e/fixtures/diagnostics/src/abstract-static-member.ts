export const fixture = true

abstract class Store {
  static abstract getValue(): number
}

export const store = Store
