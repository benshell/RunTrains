import store from './store'

export const getTrain = id => {
  const trains = store.getState().trains || []
  const train = trains.find(t => t.id === id)
  return loadFunctions(train)
}

export const loadFunctions = train => {
  if (!train) return
  const roster = store.getState().roster || []
  const rosterEntry = roster.find(r => r.address === train.addresses[0])
  const rosterFunctions = (rosterEntry && rosterEntry.functions) || []
  const functions = train.functions.map(f => ({
    lockable: false,
    ...f,
    ...rosterFunctions.find(r => r.name === f.name),
  }))
  return {
    ...train,
    functions,
  }
}
