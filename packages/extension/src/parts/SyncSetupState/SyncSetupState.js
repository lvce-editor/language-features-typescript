const syncSetups = Object.create(null)

export const set = (id, setup) => {
  syncSetups[id] = setup
}

export const get = (id, setup) => {
  return syncSetups[id]
}
