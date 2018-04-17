import React from 'react'
import Draggable from 'react-draggable'
import { withStyles } from 'material-ui/styles'

const styles = theme => ({})
const barWidth = 20
const knobHeight = 30

class ThrottleSlider extends React.PureComponent {
  state = {
    width: 0,
    height: 0,
    isActive: false,
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateSize)
    this.updateSize()
  }

  updateSize = () => {
    if (!this.rootEl) return
    this.setState({
      width: this.rootEl.clientWidth,
      height: this.rootEl.clientHeight,
    })
  }

  onStart = () => {
    this.setState({ isActive: true })
  }

  onStop = () => {
    this.setState({ isActive: false })
  }

  onDrag = (e, position) => {
    const { height } = this.state
    const value = 1 - position.y / (height - knobHeight)
    this.props.onChange(value)
  }

  render() {
    const { theme, range, value, onChange, ...props } = this.props
    const { width, height, isActive } = this.state

    let children = null
    if (width && height) {
      const knobWidth = Math.min(width, 100)
      const knobColor = isActive
        ? theme.palette.secondary.light
        : value > 0
          ? theme.palette.secondary.main
          : theme.palette.primary.main
      const position = value * (knobHeight - height) + height - knobHeight
      const label = Math.round(value * range)

      const numLines = 20
      const linePadding = 10
      const lineSpacing = (height - linePadding * 2) / (numLines - 1)
      const lines = [...Array(numLines)].map((v, i) => {
        const y = linePadding + i * lineSpacing
        const lineWidth = barWidth + (1 - y / height) * (knobWidth - barWidth)
        const x1 = (width - lineWidth) / 2
        return {
          y: y,
          x1: x1,
          x2: x1 + lineWidth,
        }
      })

      children = (
        <svg
          x="0px"
          y="0px"
          width={`${width}px`}
          height={`${height}px`}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none">
          {lines.map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y}
              x2={line.x2}
              y2={line.y}
              strokeWidth="1"
              stroke={isActive ? theme.palette.grey[500] : theme.palette.grey[600]}
            />
          ))}
          <rect
            x={(width - barWidth) / 2}
            y="0"
            fill={isActive ? theme.palette.grey[500] : theme.palette.grey[600]}
            width={barWidth}
            height={height}
            rx={barWidth / 2}
            ry={barWidth / 2}
          />
          <Draggable
            axis="y"
            position={{ x: 0, y: position }}
            bounds={{ top: 0, bottom: height - knobHeight }}
            onStart={this.onStart}
            onStop={this.onStop}
            onDrag={this.onDrag}>
            <g transform={`translate(0,0)`}>
              <rect
                x={(width - knobWidth) / 2}
                y="0"
                width={knobWidth}
                height={knobHeight}
                fill={knobColor}
                ry="15"
                rx="15"
              />
              <text
                x={width / 2}
                y={knobHeight / 2}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize="16"
                stroke="none"
                fill={theme.palette.primary.contrastText}>
                {label}
              </text>
            </g>
          </Draggable>
        </svg>
      )
    }

    return (
      <div
        ref={el => {
          this.rootEl = el
        }}
        style={{
          overflow: 'hidden',
        }}
        {...props}>
        {children}
      </div>
    )
  }
}

export default withStyles(styles, { withTheme: true })(ThrottleSlider)
