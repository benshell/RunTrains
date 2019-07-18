import React from 'react'
import Button from 'material-ui/Button'
import { withStyles } from 'material-ui/styles'
import ThrottleSlider from './ThrottleSlider'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

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
  },
})

class ThrottleControls extends React.Component {
  state = {
    speed: 0,
  }

  componentDidMount() {
    const { data } = this.props
    if (data && typeof(data.speed) !== 'undefined') {
      this.setState({
        speed: data.speed,
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    const { data } = nextProps
    if (data && typeof(data.speed) !== 'undefined') {
      this.setState({
        speed: data.speed,
      })
    }
  }

  handleFnPress = name => {
    if (this.pendingFnPress) return
    this.pendingFnPress = true
    this.previousFnState = this.props.data.functions.find(fn => fn.name === name).value
    this.props.onChange({
      id: this.props.data.id,
      functionUpdates: { [name]: true },
    })
    setTimeout(() => {
      this.pendingFnPress = false
    }, 100)
  }

  handleFnRelease = name => {
    if (this.pendingFnRelease) return
    this.pendingFnRelease = true
    setTimeout(() => {
      const functionDef = this.props.data.functions.find(f => f.name === name)
      const lockable = functionDef ? functionDef.lockable : false
      this.props.onChange({
        id: this.props.data.id,
        functionUpdates: { [name]: lockable ? !this.previousFnState : false },
      })
      this.pendingFnRelease = false
    }, 100)
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
    const buttons = visibleFns.map(f => (
      <Button
        className={classes.btnFunction}
        key={f.name}
        variant="raised"
        color={f.value ? 'secondary' : 'primary'}
        onMouseDown={this.handleFnPress.bind(this, f.name)}
        onMouseUp={this.handleFnRelease.bind(this, f.name)}
        onTouchStart={this.handleFnPress.bind(this, f.name)}
        onTouchEnd={this.handleFnRelease.bind(this, f.name)}>
        {f.label || f.name}
      </Button>
    ))

    return (
      <div className={classes.root} style={{ height: height }}>
        <div className={classes.grid}>
          <Button className={classes.btnStop} color="primary" onClick={this.handleStop}>
            Stop
          </Button>
          <Button
            className={classes.btnReverse}
            variant="fab"
            mini
            color={data.forward ? 'primary' : 'secondary'}
            onClick={this.handleReverse}>
            <ChevronLeftIcon />
          </Button>
          <Button
            className={classes.btnForward}
            variant="fab"
            mini
            color={data.forward ? 'secondary' : 'primary'}
            onClick={this.handleForward}>
            <ChevronRightIcon />
          </Button>
          <ThrottleSlider
            className={classes.slider}
            height={height - 100}
            range={127}
            value={speed}
            onChange={this.handleSpeedChange}
          />
          {buttons}
        </div>
      </div>
    )
  }
}

export default withStyles(styles)(ThrottleControls)
