export const fixture = true

class Store {
  override getValue(): number {
    return 1
  }
}

export const store = new Store()
