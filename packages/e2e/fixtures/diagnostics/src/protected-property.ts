export const fixture = true

class Base {
  protected value = 1
}

const base = new Base()
export const value = base.value
