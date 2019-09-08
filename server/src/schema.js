const {
  makeExecutableSchema,
  addMockFunctionsToSchema,
} = require('graphql-tools')
const { resolvers } = require('./resolvers')

// SEE: https://www.apollographql.com/docs/graphql-tools/generate-schema.html
// https://dev-blog.apollodata.com/tutorial-building-a-graphql-server-cddaa023c035?_ga=2.63082540.2035828546.1519438337-333598611.1515894498
// and then
// https://scotch.io/bar-talk/creating-graphql-subscriptions-in-express

const functionDefs = [...Array(29)]
  .map(
    (val, i) => `
        """
        DCC function ${i}
        """
        F${i}: Boolean`,
  )
  .join('')

const functionArgs = [...Array(29)].map((val, i) => `F${i}: Boolean`).join(', ')

const typeDefs = `
type Query {
  train(id: String): Train
  rosterEntry(address: Int): RosterEntry
  allTrains: [Train]
  allRosterEntries: [RosterEntry]
}

type Train {
  """
  An ID used internally for referring to this train configuration
  """
  id: String
  """
  The display name for this train
  """
  name: String
  """
  The DCC addresses of the locomotives
  """
  addresses: [Int]
  """
  The direction each locomotive is facing in the consist (forward == true, reversed == false)
  """
  orientations: [Boolean]
  """
  The function labels and configuration
  """
  functions: [DCCFunction]!
  """
  The current throttle value between 0 and 1
  """
  speed: Float
  """
  Is the throttle set to run in the forward direction?
  """
  forward: Boolean
}

type Subscription {
  trainAdded: Train
  trainUpdated(id: String!): Train
  trainRemoved: Train
}

input FunctionInput {
  ${functionDefs}
}

type Mutation {
  addTrain(
    name: String!,
    addresses: [Int]
    orientations: [Boolean]
  ): Train

  updateTrain(
    id: String!,
    name: String,
    addresses: [Int],
    orientations: [Boolean],
    speed: Float,
    forward: Boolean,
    functionUpdates: FunctionInput
  ): Train

  removeTrain(
    id: String!,
  ): String

  updateRoster: Boolean
}

type DCCFunction {
  """
  The name of the function
  """
  name: String!
  """
  The label for the function
  """
  label: String
  """
  The lock configuration of the function, e.g. for a bell
  """
  lockable: Boolean!
  """
  The current status of the function
  """
  value: Boolean!
}

type RosterEntry {
  """
  The name of the locomotive
  """
  name: String
  """
  The DCC address of the locomotive
  """
  address: Int
  """
  The function labels and configuration
  """
  functions: [DCCFunction]!
}
`

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

module.exports = {
  schema,
}
