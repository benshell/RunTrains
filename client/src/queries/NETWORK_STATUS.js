import gql from 'graphql-tag'

export const NETWORK_STATUS = gql`
  query {
    status: networkStatus @client {
      errors
      message
    }
  }
`
