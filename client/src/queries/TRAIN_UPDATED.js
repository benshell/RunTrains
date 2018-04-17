import gql from 'graphql-tag'

export const TRAIN_UPDATED = gql`
  subscription onTrainUpdated($id: String!) {
    trainUpdated(id: $id) {
      id
      name
      speed
      forward
      functions {
        name
        label
        lockable
        value
      }
    }
  }
`
