export const fixture = true

class Store {
  get value(index: number): number {
    return index
  }
}

export const store = new Store()
