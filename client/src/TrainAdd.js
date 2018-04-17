import React from 'react'
import { Query, Mutation } from 'react-apollo'
import TrainForm from './TrainForm'
import { ALL_TRAINS, ALL_ROSTER_ENTRIES, ADD_TRAIN } from './queries'

class TrainAdd extends React.PureComponent {
  render() {
    const { ...props } = this.props

    return (
      <Query query={ALL_ROSTER_ENTRIES}>
        {({ loading, error, data: { allRosterEntries } }) => {
          if (loading) return 'Loading roster...'
          if (error) return `Error! ${error.message}`
          return (
            <Mutation
              mutation={ADD_TRAIN}
              update={(cache, { data: { addTrain } }) => {
                const { allTrains } = cache.readQuery({ query: ALL_TRAINS })
                cache.writeQuery({
                  query: ALL_TRAINS,
                  data: { allTrains: allTrains.concat([addTrain]) },
                })
                this.props.onClose()
              }}
            >
              {(addTrain, { data }) => (
                <TrainForm
                  roster={allRosterEntries}
                  onSave={train => {
                    addTrain({
                      variables: train,
                    })
                  }}
                  {...props}
                />
              )}
            </Mutation>
          )
        }}
      </Query>
    )
  }
}

export default TrainAdd
