import gql from 'graphql-tag'

export const UPDATE_TRAIN = gql`
  mutation updateTrain(
    $id: String!
    $name: String
    $addresses: [Int]
    $orientations: [Boolean]
    $speed: Float
    $forward: Boolean
    $functionUpdates: FunctionInput
  ) {
    updateTrain(
      id: $id
      name: $name
      addresses: $addresses
      orientations: $orientations
      speed: $speed
      forward: $forward
      functionUpdates: $functionUpdates
    ) {
      id
      name
      addresses
      orientations
      speed
      forward
      functions {
        name
        label
        value
        lockable
      }
    }
  }
`
