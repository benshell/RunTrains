import React from 'react'
import { graphql } from 'react-apollo'
import { compose } from 'recompose'
import { withStyles } from '@material-ui/core/styles'
import { NETWORK_STATUS } from './queries'

const styles = theme => ({
  errors: {
    position: 'fixed',
    left: 0,
    right: 0,
    top: 0,
    background: '#d00',
    color: '#fff',
    padding: 10,
    fontSize: '1.1em',
    zIndex: 9999,
    height: 56,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export class StatusMessages extends React.PureComponent {
  state = {
    visible: false,
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.network.status.errors > this.props.network.status.errors) {
      this.setState({
        visible: true,
      })
      setTimeout(() => {
        this.setState({
          visible: false,
        })
      }, 4000)
    }
  }

  render() {
    const { classes, network } = this.props
    const { visible } = this.state
    if (!visible) return null
    return <div className={classes.errors}>{network.status.message}</div>
  }
}

const withQuery = graphql(NETWORK_STATUS, {
  name: 'network',
})

export default compose(
  withQuery,
  withStyles(styles),
)(StatusMessages)
