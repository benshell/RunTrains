import { PubSub } from 'graphql-subscriptions'
import equal from 'deep-equal'
import store from './store'
import { getTrain, loadFunctions } from './helpers'

const pubsub = new PubSub()

const trainDiff = (t, pt) => {
  const { functions, ...other } = t
  const changes = Object.keys(other)
    .filter(k => typeof t[k] !== 'object')
    .filter(k => t[k] !== pt[k])
    .reduce((acc, k) => ({ [k]: t[k], ...acc }), {})

  const fnChanges = functions
    .map(fn => [fn, pt.functions.find(ptf => ptf.name === fn.name)])
    .filter(c => !equal(c[0], c[1]))
    .map(c => c[0])

  if (fnChanges.length === 0) return changes
  return {
    ...changes,
    functions: fnChanges,
  }
}

/**
 * Subscibe to the Store to handle events
 */
let currentValue
store.subscribe(() => {
  const previousValue = currentValue || {}
  currentValue = store.getState() || {}

  // Train changes?
  if (!equal(previousValue.trains, currentValue.trains)) {
    const prevTrains = previousValue.trains || []
    const currTrains = currentValue.trains || []
    const prevIDs = prevTrains.map(t => t.id)
    const currIDs = currTrains.map(t => t.id)

    // Train added
    currTrains.filter(t => prevIDs.indexOf(t.id) === -1).forEach(t => {
      pubsub.publish('trainAdded', { trainAdded: loadFunctions(t) })
    })

    // Train removed
    prevTrains.filter(t => currIDs.indexOf(t.id) === -1).forEach(t => {
      pubsub.publish('trainRemoved', { trainRemoved: loadFunctions(t) })
    })

    // Train updated
    currTrains
      .filter(t => prevIDs.indexOf(t.id) > -1)
      .filter(t => !equal(t, prevTrains.find(pt => pt.id === t.id)))
      .forEach(t => {
        const pt = prevTrains.find(pt => pt.id === t.id)
        pubsub.publish('trainUpdated', {
          trainUpdated: loadFunctions(t),
          changes: trainDiff(t, pt),
        })
      })
  }
})

export default pubsub
