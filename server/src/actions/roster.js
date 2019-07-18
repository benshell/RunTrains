const types = require('./types')

/**
 * Action creators
 */
function syncRoster(data) {
  const entries = Object.values(data)
  return {
    type: types.SYNC_ROSTER,
    roster: entries
      .map(({ data }) => data)
      .filter(data => data)
      .map(data => ({
        name: data.name,
        address: parseInt(data.address, 10),
        functions: data.functionKeys.map(f => ({
          name: f.name,
          label: f.label,
          lockable: f.lockable,
        })),
      })),
  }
}

module.exports = { syncRoster }
