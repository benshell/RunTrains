import React from 'react'
import { withRouter } from 'react-router'
import { withStyles } from 'material-ui/styles'
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import TrainIcon from '@material-ui/icons/Train'
// import ListIcon from '@material-ui/icons/List'
// import PeopleIcon from '@material-ui/icons/People'
// import SettingsIcon from '@material-ui/icons/Settings'

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
    </ListItem>
    <ListItem
      button
      onClick={() => {
        history.push('/settings')
      }}
    >
      <ListItemIcon>
        <SettingsIcon />
      </ListItemIcon>
      <ListItemText primary="Settings" />
    </ListItem> */}
  </List>
)

export default withRouter(withStyles(styles)(Menu))
