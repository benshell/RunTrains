import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import SwipeableViews from 'react-swipeable-views'
import { withStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/AddCircle'
import Fab from '@material-ui/core/Fab'
import Drawer from '@material-ui/core/Drawer'
import EditIcon from '@material-ui/icons/Edit'
import Throttle from './Throttle'
import TrainEdit from './TrainEdit'

const styles = theme => ({
  root: {
    width: '100%',
    height: '100%',
    flex: '0 0 100%',
    display: 'flex',
    flexDirection: 'column',
  },
  throttles: {
    flexBasis: '100%',
    flexGrow: 1,
    overflow: 'hidden',
  },
  actionBtn: {
    position: 'absolute',
    right: '1em',
    bottom: '1em',
  },
})

class ThrottleTabs extends React.PureComponent {
  state = {
    currentThrottle: 0,
    editThrottle: false,
    height: 0,
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateHeight)
    this.updateHeight()
  }

  componentDidUpdate() {
    this.updateHeight()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateHeight)
  }

  handleTrainEdit = () => {
    this.setState({
      editThrottle: !this.state.editThrottle,
    })
  }

  handleThrottleChange = (event, value) => {
    this.setState({ currentThrottle: value })
  }

  updateHeight = () => {
    this.setState({
      height: this.throttlesEl.clientHeight,
    })
  }

  render() {
    const { classes, theme, throttles, onAdd } = this.props
    const { currentThrottle, height } = this.state

    return (
      <div className={classes.root}>
        <AppBar position="static" color="default">
          <Toolbar>
            <Tabs
              value={currentThrottle}
              onChange={this.handleThrottleChange}
              indicatorColor="primary"
              textColor="primary"
              scrollButtons="on"
            >
              {throttles.map(throttle => (
                <Tab key={throttle.name} label={throttle.name} />
              ))}
            </Tabs>
            <IconButton onClick={onAdd} color="inherit">
              <AddIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <div
          ref={el => {
            this.throttlesEl = el
          }}
          className={classes.throttles}
        >
          <SwipeableViews
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={currentThrottle}
            onChangeIndex={this.handleThrottleChange.bind(this, null)}
          >
            {throttles.map(throttle => (
              <Throttle key={throttle.name} id={throttle.id} height={height} />
            ))}
          </SwipeableViews>
        </div>

        <Fab
          color="primary"
          aria-label="edit"
          className={classes.actionBtn}
          onClick={this.handleTrainEdit}
        >
          <EditIcon />
        </Fab>

        <Drawer
          anchor="bottom"
          open={this.state.editThrottle}
          onClose={this.handleTrainEdit}
        >
          <TrainEdit
            onClose={this.handleTrainEdit}
            id={throttles[currentThrottle].id}
          />
        </Drawer>
      </div>
    )
  }
}

export default withStyles(styles, { withTheme: true })(ThrottleTabs)
