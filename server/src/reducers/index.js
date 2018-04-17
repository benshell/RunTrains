import { combineReducers } from 'redux'
import trains from './trains'
import roster from './roster'

export default combineReducers({
  trains,
  roster,
})
