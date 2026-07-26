const getType = (value) => {
  switch (typeof value) {
    case 'boolean':
      return 'boolean'
    case 'function':
      return 'function'
    case 'number':
      return 'number'
    case 'object':
      if (value === null) {
        return 'null'
      }
      if (Array.isArray(value)) {
        return 'array'
      }
      return 'object'
    case 'string':
      return 'string'
    case 'undefined':
      return 'undefined'
    default:
      return 'unknown'
  }
}

export const object = (value) => {
  const type = getType(value)
  if (type !== 'object') {
    throw new Error('expected value to be of type object')
  }
}

export const number = (value) => {
  const type = getType(value)
  if (type !== 'number') {
    throw new Error('expected value to be of type number')
  }
}

export const array = (value) => {
  const type = getType(value)
  if (type !== 'array') {
    throw new Error('expected value to be of type array')
  }
}

export const string = (value) => {
  const type = getType(value)
  if (type !== 'string') {
    throw new Error('expected value to be of type string')
  }
}

export const boolean = (value) => {
  const type = getType(value)
  if (type !== 'boolean') {
    throw new Error('expected value to be of type boolean')
  }
}
