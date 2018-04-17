import gql from 'graphql-tag'

export const TRAIN_ADDED = gql`
  subscription {
    trainAdded {
      id
      name
    }
  }
`
