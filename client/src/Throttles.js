import React, { PureComponent } from 'react'
import { Query } from 'react-apollo'
import { withStyles } from '@material-ui/core/styles'
import ThrottleTabs from './ThrottleTabs'
import Button from '@material-ui/core/Button'
import Drawer from '@material-ui/core/Drawer'
import TrainAdd from './TrainAdd'
import { ALL_TRAINS } from './queries'

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
})

class Throttles extends PureComponent {
  state = {
    requestThrottle: false,
  }

  toggleThrottleRequest = () => {
    this.setState({
      requestThrottle: !this.state.requestThrottle,
    })
  }

  render() {
    const { classes } = this.props

    return (
      <Query query={ALL_TRAINS}>
        {({ loading, error, data: trains }) => {
          if (loading) return 'Loading...'
          if (error) return `Error! ${error.message}`
          return (
            <div className={classes.root}>
              {trains.allTrains.length ? (
                <ThrottleTabs
                  onAdd={this.toggleThrottleRequest}
                  throttles={trains.allTrains}
                />
              ) : (
                <Button
                  className={classes.requestBtn}
                  variant="contained"
                  size="large"
                  color="primary"
                  onClick={this.toggleThrottleRequest}
                >
                  Add train
                </Button>
              )}

              <Drawer
                anchor="bottom"
                open={this.state.requestThrottle}
                onClose={this.toggleThrottleRequest}
              >
                <TrainAdd onClose={this.toggleThrottleRequest} />
              </Drawer>
            </div>
          )
        }}
      </Query>
    )
  }
}

export default withStyles(styles)(Throttles)
