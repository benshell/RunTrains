import React from 'react'
import Button from '@material-ui/core/Button'

class ThrottleFn extends React.PureComponent {
  state = {
    pendingFnPress: false,
    pendingFnRelease: false,
  }

  handleFnPress = () => {
    if (this.state.pendingFnPress) return

    // debounce: this fn can't be pressed again OR released for a certain amount of time
    setTimeout(() => {
      this.setState({ pendingFnPress: false }, () => {
        // Has the function already been released?
        if (this.state.pendingFnRelease) {
          this.setState({ pendingFnRelease: false }, () => {
            this.handleFnRelease()
          })
        }
      })
    }, 500)

    // update then state and then continue
    this.setState({ pendingFnPress: true }, () => {
      this.previousFnState = this.props.fn.value
      if (this.previousFnState !== true) {
        this.props.onChange(true)
      }
    })
  }

  handleFnRelease = () => {
    if (this.state.pendingFnRelease) return

    // update then state and then continue
    this.setState({ pendingFnRelease: true }, () => {
      // nothing to do if the fn press is still pending
      if (this.state.pendingFnPress) return

      const functionDef = this.props.fn
      const lockable = functionDef ? functionDef.lockable : false
      const newVal = lockable ? !this.previousFnState : false
      this.props.onChange(newVal)
      this.setState({ pendingFnRelease: false })
    })
  }

  render() {
    const { fn, ...props } = this.props

    return (
      <Button
        {...props}
        variant="contained"
        color={fn.value ? 'secondary' : 'primary'}
        onMouseDown={this.handleFnPress}
        onMouseUp={this.handleFnRelease}
        onTouchStart={this.handleFnPress}
        onTouchEnd={this.handleFnRelease}
      >
        {fn.label || fn.name}
      </Button>
    )
  }
}

export default ThrottleFn
