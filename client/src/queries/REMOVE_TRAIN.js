import gql from 'graphql-tag'

export const REMOVE_TRAIN = gql`
  mutation removeTrain($id: String!) {
    removeTrain(id: $id)
  }
`
