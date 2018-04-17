import store from './store'
import { syncRoster } from './actions/roster'
import rosterData from '../tests/data/roster'

store.dispatch(syncRoster(rosterData))
