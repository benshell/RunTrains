import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Frame from './Frame'
import Throttles from './Throttles'
import System from './System'
import withRoot from './withRoot'
import { withStyles } from '@material-ui/core/styles'
import './App.css'

const styles = theme => ({
  root: {
    color: '#fff',
  },
})

class App extends Component {
  componentDidMount() {
    document.body.addEventListener(
      'touchmove',
      event => {
        event.preventDefault()
      },
      {
        passive: false,
        useCapture: false,
      },
    )
  }

  render() {
    return (
      <Router>
        <Frame>
          <Switch>
            <Route path="/system" component={System} />
            <Route component={Throttles} />
          </Switch>
        </Frame>
      </Router>
    )
  }
}

export default withRoot(withStyles(styles)(App))
