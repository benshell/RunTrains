const types = require('../actions/types')

const roster = (state = [], action) => {
  const { type, ...data } = action
  switch (type) {
    case types.SYNC_ROSTER:
      return data.roster
    default:
      return state
  }
}

module.exports = roster
