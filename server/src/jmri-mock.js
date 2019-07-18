const store = require('./store')
const { syncRoster } = require('./actions/roster')
const rosterData = require('../tests/data/roster')

store.dispatch(syncRoster(rosterData))
