export const state = {
  pending: Object.create(null),
}

export const register = (id, resolve, reject) => {
  state.pending[id] = {
    resolve,
    reject,
  }
}

export const resolve = (id, result) => {
  if (!(id in state.pending)) {
    console.warn('cannot resolve callback', result)
    return
  }
  state.pending[id].resolve(result)
  delete state.pending[id]
}

export const reject = (id, error) => {
  if (!(id in state.pending)) {
    console.warn('cannot reject callback', error)
    return
  }
  state.pending[id].reject(error)
  delete state.pending[id]
}

export const rejectAll = (error) => {
  for (const key in state.pending) {
    reject(key, error)
  }
}
