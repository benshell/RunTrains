import gql from 'graphql-tag'

export const TRAIN = gql`
  query train($id: String!) {
    train(id: $id) {
      id
      name
      addresses
      orientations
      speed
      forward
      functions {
        name
        value
        label
        lockable
      }
    }
  }
`
