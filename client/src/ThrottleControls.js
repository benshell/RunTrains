import React from 'react'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import ThrottleSlider from './ThrottleSlider'
import ThrottleFn from './ThrottleFn'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import StopIcon from '@material-ui/icons/Stop'
import { Fab } from '@material-ui/core'

const styles = theme => ({
  root: {
    height: '100%',
    minHeight: 300,
    maxWidth: '100%',
    boxShadow: '0 0 10px 0 rgba(0, 0, 0, .25)',
    textAlign: 'center',
    padding: 15,
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '45px 45px 1fr 1fr',
    gridGap: '10px',
    height: '100%',
    minHeight: 0,
    minWidth: 0,
    maxHeight: '100%',
    maxWidth: '100%',
  },
  slider: {
    gridColumn: '1 / 3',
    gridRow: '1 / 9',
  },
  btnFunction: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  btnReverse: {
    gridColumn: 1,
    gridRow: 9,
    justifySelf: 'center',
  },
  btnForward: {
    gridColumn: 2,
    gridRow: 9,
    justifySelf: 'center',
  },
  btnStop: {
    gridColumn: '1 / 3',
    gridRow: 10,
    justifySelf: 'center',
    backgroundColor: '#ff0000',
  },
})

class ThrottleControls extends React.Component {
  state = {
    speed: 0,
  }

  componentDidMount() {
    const { data } = this.props
    if (data && typeof data.speed !== 'undefined') {
      this.setState({
        speed: data.speed,
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    const { data } = nextProps
    if (data && typeof data.speed !== 'undefined') {
      this.setState({
        speed: data.speed,
      })
    }
  }

  handleReverse = () => {
    if (this.props.data.forward) {
      this.setState({ speed: 0 })
      if (this.speedDebounce) clearTimeout(this.speedDebounce)
      this.props.onChange({
        id: this.props.data.id,
        speed: 0.0,
        forward: false,
      })
    }
  }

  handleForward = () => {
    if (!this.props.data.forward) {
      this.setState({ speed: 0 })
      if (this.speedDebounce) clearTimeout(this.speedDebounce)
      this.props.onChange({
        id: this.props.data.id,
        speed: 0.0,
        forward: true,
      })
    }
  }

  handleStop = () => {
    this.handleSpeedChange(0)
  }

  handleSpeedChange = speed => {
    this.setState({ speed: speed })
    if (this.speedDebounce) clearTimeout(this.speedDebounce)
    this.speedDebounce = setTimeout(() => {
      this.props.onChange({
        id: this.props.data.id,
        speed: Math.round(speed * 100000000) / 100000000,
      })
    }, 100)
  }

  saveChanges = value => {}

  render() {
    const { classes, height = 0, data = {} } = this.props
    const { speed } = this.state

    const functions = data.functions || []
    const labelledFns = functions.filter(f => f.label)
    const standardFns = functions.filter((f, i) => i < 13)
    const visibleFns = labelledFns.length ? labelledFns : standardFns

    return (
      <div className={classes.root} style={{ height: height }}>
        <div className={classes.grid}>
          <Button
            className={classes.btnStop}
            variant="contained"
            color="secondary"
            onClick={this.handleStop}
          >
            <StopIcon />
            Stop
          </Button>
          <Fab
            className={classes.btnReverse}
            size="small"
            color={data.forward ? 'primary' : 'secondary'}
            onClick={this.handleReverse}
          >
            <ChevronLeftIcon />
          </Fab>
          <Fab
            className={classes.btnForward}
            size="small"
            color={data.forward ? 'secondary' : 'primary'}
            onClick={this.handleForward}
          >
            <ChevronRightIcon />
          </Fab>
          <ThrottleSlider
            className={classes.slider}
            height={height - 100}
            range={127}
            value={speed}
            onChange={this.handleSpeedChange}
          />
          {visibleFns.map(fn => (
            <ThrottleFn
              fn={fn}
              key={fn.name}
              onChange={val => {
                this.props.onChange({
                  id: this.props.data.id,
                  functionUpdates: { [fn.name]: val },
                })
              }}
              className={classes.btnFunction}
            />
          ))}
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(ThrottleControls)
