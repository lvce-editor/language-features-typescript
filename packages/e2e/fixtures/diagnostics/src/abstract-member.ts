export const fixture = true

abstract class Shape {
  abstract area(): number
}

class Circle extends Shape {}

export const circle = Circle
