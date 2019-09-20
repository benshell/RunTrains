import React from 'react'
import { Query, Mutation } from 'react-apollo'
import TrainForm from './TrainForm'
import {
  ALL_TRAINS,
  ALL_ROSTER_ENTRIES,
  TRAIN,
  UPDATE_TRAIN,
  REMOVE_TRAIN,
} from './queries'

class TrainEdit extends React.PureComponent {
  render() {
    const { id, ...props } = this.props

    return (
      <Query query={TRAIN} variables={{ id }}>
        {({ loading, error, data: { train } }) => {
          if (loading) return 'Loading train...'
          if (error) return `Error! ${error.message}`
          return (
            <Query query={ALL_ROSTER_ENTRIES}>
              {({ loading, error, data }) => {
                if (loading) return 'Loading roster...'
                if (error) return `Error! ${error.message}`
                return (
                  <Mutation
                    mutation={REMOVE_TRAIN}
                    variables={{ id: train.id }}
                    update={(cache, { data: { removeTrain: removedId } }) => {
                      const { allTrains } = cache.readQuery({
                        query: ALL_TRAINS,
                      })
                      cache.writeQuery({
                        query: ALL_TRAINS,
                        data: {
                          allTrains: allTrains.filter(t => t.id !== removedId),
                        },
                      })
                      this.props.onClose()
                    }}
                  >
                    {removeTrain => (
                      <Mutation
                        mutation={UPDATE_TRAIN}
                        variables={{ id: train.id }}
                        update={(cache, { data: { updateTrain } }) => {
                          const { allTrains } = cache.readQuery({
                            query: ALL_TRAINS,
                          })
                          cache.writeQuery({
                            query: ALL_TRAINS,
                            data: {
                              allTrains: allTrains.map(t => {
                                if (t.id === updateTrain.id) return updateTrain
                                return t
                              }),
                            },
                          })
                          cache.writeQuery({
                            query: TRAIN,
                            variables: { id: updateTrain.id },
                            data: { train: updateTrain },
                          })
                        }}
                      >
                        {updateTrain => (
                          <TrainForm
                            initialTrain={train}
                            roster={(data && data.allRosterEntries) || []}
                            onSave={train => {
                              updateTrain({
                                variables: train,
                                optimisticResponse: {
                                  __typename: 'Mutation',
                                  updateTrain: train,
                                },
                              })
                              this.props.onClose()
                            }}
                            onRemove={removeTrain}
                            {...props}
                          />
                        )}
                      </Mutation>
                    )}
                  </Mutation>
                )
              }}
            </Query>
          )
        }}
      </Query>
    )
  }
}

export default TrainEdit
