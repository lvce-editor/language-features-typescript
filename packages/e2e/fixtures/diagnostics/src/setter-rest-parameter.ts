export const fixture = true

class Store {
  set value(...input: number[]) {}
}

export const store = new Store()
