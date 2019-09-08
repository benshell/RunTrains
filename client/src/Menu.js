import React from 'react'
import { withRouter } from 'react-router'
import { withStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import TrainIcon from '@material-ui/icons/Train'
// import ListIcon from '@material-ui/icons/List'
// import PeopleIcon from '@material-ui/icons/People'
import SettingsIcon from '@material-ui/icons/Settings'

const styles = theme => ({})

const Menu = ({ history }) => (
  <List component="nav">
    <ListItem
      button
      onClick={() => {
        history.push('/')
      }}
    >
      <ListItemIcon>
        <TrainIcon />
      </ListItemIcon>
      <ListItemText primary="Trains" />
    </ListItem>
    {/* <ListItem
      button
      onClick={() => {
        history.push('/roster')
      }}
    >
      <ListItemIcon>
        <ListIcon />
      </ListItemIcon>
      <ListItemText primary="Roster" />
    </ListItem>
    <ListItem
      button
      onClick={() => {
        history.push('/users')
      }}
    >
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="Users" />
    </ListItem>*/}
    <ListItem
      button
      onClick={() => {
        history.push('/system')
      }}
    >
      <ListItemIcon>
        <SettingsIcon />
      </ListItemIcon>
      <ListItemText primary="System" />
    </ListItem>
  </List>
)

export default withRouter(withStyles(styles)(Menu))
