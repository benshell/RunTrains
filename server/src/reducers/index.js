const { combineReducers } = require('redux')
const trains = require('./trains')
const roster = require('./roster')

module.exports = combineReducers({
  trains,
  roster,
})
