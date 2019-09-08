import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
// import Button from '@material-ui/core/Button'

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

const System = () => {
  return <Typography>Placeholder for system settings and controls.</Typography>
}

export default withStyles(styles)(System)
