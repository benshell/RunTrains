import gql from 'graphql-tag'

export const ALL_ROSTER_ENTRIES = gql`
  {
    allRosterEntries {
      name
      address
    }
  }
`
