import { withFilter } from 'graphql-subscriptions'
import store from './store'
import pubsub from './pubsub'
import { addTrain, updateTrain, removeTrain } from './actions/trains'
import { getTrain, loadFunctions } from './helpers'

export const resolvers = {
  Query: {
    train: (root, args) => {
      return getTrain(args.id)
    },
    rosterEntry: (root, args) => {
      const roster = store.getState().roster
      return roster.find(r => r.address === args.address)
    },
    allTrains: () => {
      return (store.getState().trains || []).map(t => loadFunctions(t))
    },
    allRosterEntries: () => {
      return store.getState().roster
    },
  },
  Subscription: {
    trainAdded: {
      subscribe: withFilter(() => pubsub.asyncIterator('trainAdded'), (payload, variables) => true),
    },
    trainUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('trainUpdated'),
        (payload, variables) => {
          return payload.trainUpdated.id === variables.id
        },
      ),
    },
    trainRemoved: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('trainRemoved'),
        (payload, variables) => true,
      ),
    },
  },
  Mutation: {
    addTrain: (root, args) => {
      const action = addTrain(args)
      store.dispatch(action)
      return getTrain(action.id)
    },
    updateTrain: (root, args) => {
      store.dispatch(
        updateTrain({
          ...args,
          source: 'graphql',
        }),
      )
      return getTrain(args.id)
    },
    removeTrain: (root, args) => {
      store.dispatch(removeTrain(args.id))
      return args.id
    },
  },
}
