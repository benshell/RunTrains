import React from 'react'
import { graphql } from 'react-apollo'
import { compose } from 'recompose'
import ThrottleControls from './ThrottleControls'
import { TRAIN, UPDATE_TRAIN, TRAIN_UPDATED } from './queries'

export class Throttle extends React.PureComponent {
  componentDidMount() {
    this.props.subscribeToChanges({
      id: this.props.id,
    })
  }

  handleChange = value => {
    this.props.updateTrain(value)
  }

  render() {
    const { data, height } = this.props
    if (data.loading) return <div>Loading...</div>
    if (!data.train) return <div>No train data loaded!</div>
    const { train } = data
    return (
      <ThrottleControls
        data={train}
        onChange={this.handleChange}
        height={height}
      />
    )
  }
}

const withQuery = graphql(TRAIN, {
  name: 'data',
  options: props => ({
    variables: {
      id: props.id,
    },
  }),
  props: props => {
    return {
      ...props,
      subscribeToChanges: params => {
        return props.data.subscribeToMore({
          document: TRAIN_UPDATED,
          variables: {
            id: params.id,
          },
          updateQuery: (prev, { subscriptionData }) => {
            return prev
          },
        })
      },
    }
  },
})

const withMutation = graphql(UPDATE_TRAIN, {
  props({ ownProps, mutate }) {
    return {
      updateTrain(vars) {
        const train = this.data.train
        const optimisticUpdate = {
          ...train,
          ...vars,
          functions: train.functions.map(fn => {
            if (
              !vars.functions ||
              typeof vars.functions[fn.name] === 'undefined' ||
              vars.functions[fn.name] === fn.value
            )
              return fn
            return { ...fn, value: vars.functions[fn.name] }
          }),
        }
        return mutate({
          variables: vars,
          optimisticResponse: {
            __typename: 'Mutation',
            updateTrain: optimisticUpdate,
          },
          update: (proxy, { data: { updateTrain } }) => {
            const data = proxy.readQuery({
              query: TRAIN,
              variables: { id: updateTrain.id },
            })
            // TODO: Send increment updates for functions
            data.train = { ...data.train, ...updateTrain }
            proxy.writeQuery({
              query: TRAIN,
              variables: { id: updateTrain.id },
              data: data,
            })
          },
        })
      },
    }
  },
})

export default compose(
  withMutation,
  withQuery,
)(Throttle)
