import React from 'react'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'
import green from '@material-ui/core/colors/green'
import CssBaseline from '@material-ui/core/CssBaseline'

const fontColor = {
  color: '#fff',
}

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    contrastThreshold: 3,
    background: {
      default: '#333',
    },
    primary: {
      light: blue[400],
      main: blue[500],
      dark: blue[700],
    },
    secondary: {
      light: green[400],
      main: green[500],
      dark: green[700],
    },
  },
  typography: {
    display2: fontColor,
    display3: fontColor,
  },
})

function withRoot(Component) {
  function WithRoot(props) {
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...props} />
      </MuiThemeProvider>
    )
  }

  return WithRoot
}

export default withRoot
