export const fixture = true

class Store {
  get value<T>(): T {
    return undefined as T
  }
}

export const store = new Store()
