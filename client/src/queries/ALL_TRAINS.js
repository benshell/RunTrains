import gql from 'graphql-tag'

export const ALL_TRAINS = gql`
  {
    allTrains {
      id
      name
    }
  }
`
