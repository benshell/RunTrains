import gql from 'graphql-tag'

export const ADD_TRAIN = gql`
  mutation addTrain($name: String!, $addresses: [Int], $orientations: [Boolean]) {
    addTrain(name: $name, addresses: $addresses, orientations: $orientations) {
      id
      name
      speed
      forward
      functions {
        label
        name
        value
        lockable
      }
    }
  }
`
